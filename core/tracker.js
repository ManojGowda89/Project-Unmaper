const mongoose = require('mongoose');
const { dburl } = require('../config/sealed');

const connection = mongoose.createConnection(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const schema = new mongoose.Schema({
    url: String,
    command: String,
    stderr: String,
    timestamp: { type: Date, default: Date.now },
    platform: String,
    ip: String,
    username: String,
    directory: String
});

const Log = connection.model('LogEntry', schema);

async function logToDatabase(req, command, stderr, context) {
    const data = {
        url: req.headers.referer || req.headers.origin || req.protocol + '://' + req.get('host') + req.originalUrl,
        command,
        stderr,
        platform: context.platform,
        ip: req.ip,
        username: context.username,
        directory: context.workingDirectory
    };

    try {
        await new Log(data).save();
    } catch (e) {
        console.warn('Failed to save log:', e.message);
    }
}

module.exports = { logToDatabase };
