const gateway = require('./routes/gateway');

function unmaper(app) {
    gateway.attachRoutes(app);
}

module.exports = unmaper;
