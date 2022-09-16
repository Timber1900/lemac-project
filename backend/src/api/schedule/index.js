const controller = require('./controller');

function date_to_sql(date) {
  const d = new Date(date);

  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

module.exports = {
  createEvent: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    if (req.body && req.body.entry && req.body.exit) {
      const data = await controller.createEvent(
        req.db,
        req.body.entry,
        req.body.exit,
        req.body.userId
      );

      const response = {
        id: data.id,
        userId: data.user_id,
        entry: data.entry,
        exit: data.exit,
        created_at: data.created_at,
      };
      res.json(response);
      return;
    }
    res.sendStatus(400);
  },
  getEvents: async (req, res) => {
    if (!req.user || !req.user.admin) {
      res.sendStatus(401);
      return;
    }
    const data = await controller.getEvents(req.db);

    if (data.length === 0) {
      res.json([]);
    } else if (data.length > 0) {
      const response = data.map((x) => ({
        id: x.id,
        userId: x.user_id,
        entry: x.entry,
        exit: x.exit,
        created_at: x.created_at,
      }));
      res.json(response);
      return;
    } else {
      res.sendStatus(400);
    }
  },
  editEvent: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }
    if (req.body && req.body.entry && req.body.exit) {
      //how to verifie that the hours exists in db
      const data = await controller.editEvent(
        req.db,
        req.body.entry,
        req.body.exit,
        req.body.userId,
        req.params.id
      );
      if (!data) {
        res.sendStatus(404);
        return;
      }
      const response = {
        id: data.id,
        userId: data.user_id,
        entry: data.entry,
        exit: data.exit,
        created_at: data.created_at,
      };

      res.json(response);
      return;
    }
    res.sendStatus(400);
  },
  deleteEvents: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }
    try {
      const conf = await controller.deleteEvents(req.db, req.params.id);
      if (conf) {
        res.sendStatus(204);
        return;
      } else {
        res.sendStatus(404);
        return;
      }
    } catch (e) {
      res.sendStatus(400);
      return;
    }
  },
  setUserTarget: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    if (req.body && req.body.week !== null && req.body.userId !== null) {
      //how to verifie that the hours exists in db
      const data = await controller.setUserTargets(
        req.db,
        req.body.targetHours,
        req.body.targetOffset,
        req.body.week,
        req.body.userId
      );

      if (!data) {
        res.sendStatus(404);
        return;
      }
      const response = {
        id: data.id,
        userId: data.user_id,
        week: data.week,
        targetHours: data.target_hours,
        targetOffset: data.target_offset,
      };

      res.json(response);
      return;
    }
    res.sendStatus(400);
  },
  getUserTargets: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    const data = await controller.getUserTargets(req.db);

    if (data.length === 0) {
      res.json([]);
    } else if (data.length > 0) {
      const response = data.map((val) => ({
        id: val.id,
        userId: val.user_id,
        week: val.week,
        targetHours: val.target_hours,
        targetOffset: val.target_offset,
      }));
      res.json(response);
      return;
    } else {
      res.sendStatus(400);
    }
  },
  setOffDay: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    if (req.body && req.body.date !== null) {
      const data = await controller.setOffDays(
        req.db,
        date_to_sql(req.body.date)
      );

      if (!data) {
        res.sendStatus(404);
        return;
      }
      const response = {
        date: data.date,
        id: data.id
      };

      res.json(response);
      return;
    }
    res.sendStatus(400);
  },
  getOffDays: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    const data = await controller.getOffDays(req.db);

    if (data.length === 0) {
      res.json([]);
    } else if (data.length > 0) {
      const response = data.map((val) => ({
        date: val.date,
        id: val.id
      }));
      res.json(response);
      return;
    } else {
      res.sendStatus(400);
    }
  },
  deleteOffDay: async (req, res) => {
    if (!req.user) {
      res.sendStatus(401);
      return;
    }

    try {
      const conf = await controller.deleteOffDay(req.db, req.params.id);
      if (conf) {
        res.sendStatus(204);
        return;
      } else {
        res.sendStatus(404);
        return;
      }
    } catch (e) {
      res.sendStatus(400);
      return;
    }
  }
};
