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
      const data = await controller.getHours(req.db, rooms[key]);
      if (data) {
        const response_individual = data.events.map((x) => {
          let start = x.period.start.split('/');
          start = [start[1], start[0], start[2]];
          start = start.reduce((cur, prev) => `${cur}${prev}/`, '');

          let end = x.period.end.split('/');
          end = [end[1], end[0], end[2]];
          end = end.reduce((cur, prev) => `${cur}${prev}/`, '');

          return {
            title: x.title,
            entry: start.slice(0, -1),
            exit: end.slice(0, -1),
            description: x.description,
            room: data.name,
          };
        });

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
