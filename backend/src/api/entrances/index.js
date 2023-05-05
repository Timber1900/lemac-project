const controller = require('./controller');

module.exports = {
  handleEntrance: async (req, res, ws_server) => {
    const [socket] = ws_server.clients;

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
  },
  async getLemacUserData(req, res) {
    //auth check
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    const data = await controller.getLemacUserData(req.db, req.params.mifare_id);
    if (data == null) {
      res.sendStatus(400);
      return
    }

    const response = {
      id: data.id,
      name: data.name,
      mifare_id: data.mifare_id,
      ist_id: data.ist_id,
      state: data.state,
      email: data.email,
      course: data.course,
      last_modified: data.last_modified
    }

    res.json(response);
  },

  async getLemacUsersData(req, res) {
    //auth check
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    const data = await controller.getLemacUsersData(req.db);
    if (data.length === 0) {
      //no entries in db
      res.json([]);
      return;
    } else if (data.length > 0) {
      const response = data.map((x) => ({
        id: x.id,
        name: x.name,
        mifare_id: x.mifare_id,
        ist_id: x.ist_id,
        state: x.state,
        email: x.email,
        course: x.course,
        last_modified: x.last_modified
      }));
      res.json(response);
      return;
    } else {
      res.sendStatus(400);
    }

    const response =

    res.json(response);
  },

  async createUser(req, res) {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    if (req.body && req.body.mifare_id && req.body.name && req.body.ist_id && req.body.email && req.body.course) {
      const data = await controller.createUser(req.db, req.body.mifare_id, req.body.name, req.body.ist_id, req.body.email, req.body.course);

      const response = {
        id: data.id,
        name: data.name,
        mifare_id: data.mifare_id,
        ist_id: data.ist_id,
        state: data.state,
        email: data.email,
        course: data.course,
        last_modified: data.last_modified
      }
      res.json(response);
      return;
    }
    res.sendStatus(400);
  },

  async changeUserState(req, res) {
    console.log(req.body)
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    if (req.body && req.body.state && req.body.ist_id) {
      if(req.body.state !== "online" && req.body.state !== "offline" && req.body.state !== "in_break") {
        res.sendStatus(400);
        return;
      }

      const data = await controller.changeUserState(req.db, req.body.state, req.body.id);
      const response = {
        id: data.id,
        name: data.name,
        mifare_id: data.mifare_id,
        ist_id: data.ist_id,
        state: data.state,
        email: data.email,
        course: data.course,
        last_modified: data.last_modified
      }
      res.json(response);
      return;
    }
    res.sendStatus(400);

  }
};
