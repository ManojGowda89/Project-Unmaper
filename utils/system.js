const os = require('os');

function getSystemContext(workingDirectory) {
    return {
        platform: process.platform,
        hostname: os.hostname(),
        username: os.userInfo().username,
        workingDirectory,
        timestamp: new Date().toISOString()
    };
}

module.exports = { getSystemContext };
