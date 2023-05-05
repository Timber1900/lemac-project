const controller = require('./controller');

module.exports = {
  handleEntrance: async (req, res, ws_server) => {
    const [socket] = ws_server.clients;

    console.log(req.body)

    if (!socket) {
      res.sendStatus(500);
      return
    }

    if (req.body.mifare_id === null) {
      res.sendStatus(400)
    }


    if (req.body.key !== "e6614103e7224937") {
      res.sendStatus(401);
      return
    }

    socket.send(req.body.mifare_id);
    res.sendStatus(200);
  }
};
