const controller = require('./controller');

module.exports = {
  getHours: async (req, res) => {
    //auth check
    if (!req.user || !req.user.admin) {
      res.sendStatus(401);
      return;
    }

    const rooms = {
      SDM: 2448131364045,
      MOM: 2448131364044,
      LTI: 2448131364042,
    };

    let response = [];

    for (const key in rooms) {
      const data = await controller.getHours(req.db, req.query.month, req.query.year, rooms[key]);
      if (data) {
        const response_individual = data.events.map((x) => ({
          title: x.title,
          entry: x.period.start,
          exit: x.period.end,
          description: x.description,
          room: data.name,
        }));

        response = [...response, ...response_individual];
      }
    }

    res.json(response);

    /*
    if (data.length === 0) {
      //no hours in db
      res.json([]);
      return;
    } else if (data.length > 0) {
      const response = data.map((x) => ({
        id: x.id,
        userId: x.user_id,
        entry: x.entry,
        exit: x.exit,
        time: x.time,
        user: {
          name: x.name,
        },
      }));
      res.json(response);
      return;
    } else {
      //bad request
      res.sendStatus(400);
    }
    */
  },
};
