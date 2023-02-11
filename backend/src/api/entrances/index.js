const controller = require('./controller');

module.exports = {
  handleEntrance: async (req, res, ws_server) => {
    const [socket] = ws_server.clients;

    if(!socket || req.body.id === null) {
      res.sendStatus(500);
      return
    }

    if(req.body.machine_hhid != 1) {
      res.sendStatus(401);
      return
    }

    socket.send(req.body.id);
    res.sendStatus(200);
  }
};
