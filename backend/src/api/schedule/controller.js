module.exports = {
  createEvent: async (database, entry, exit, userId) => {
    try {
      await database.execute(
        'INSERT INTO `monitor_schedule` (entry, `exit`, user_id) VALUES ( ? , ? , ? )',
        [entry, exit, userId]
      );

      const [results] = await database.execute(
        'SELECT * FROM monitor_schedule WHERE id=LAST_INSERT_ID()'
      );
      return results[0];
    } catch (e) {
      console.error(e);
      return;
    }
  },
  getEvents: async (database) => {
    try {
      const [results] = await database.execute(
        `SELECT l.*, u.name FROM monitor_schedule l LEFT JOIN users u USING (user_id)`
      );
      return results;
    } catch (e) {
      console.error(e);
      return;
    }
  },
  editEvent: async (database, entry, exit, userId, id) => {
    try {
      const [check] = await database.execute('SELECT * FROM monitor_schedule WHERE id=?', [id]);
      if (check.length === 0) return false;
      await database.execute(
        'UPDATE monitor_schedule SET entry = ?, `exit` = ?, user_id = ? WHERE id = ?',
        [entry, exit, userId, id]
      );
      const [results] = await database.execute('SELECT * FROM monitor_schedule WHERE id= ?', [id]);
      return results[0];
    } catch (e) {
      return e.code;
    }
  },
  deleteEvents: async (database, id) => {
    try {
      const [results] = await database.execute('SELECT * FROM monitor_schedule WHERE id=?', [id]);
      if (results.length === 0) return false;
      await database.execute('DELETE FROM monitor_schedule WHERE id = ?', [id]);
      return true;
    } catch (e) {
      console.error(e);
    }
  },
  getUserTargets: async (database) => {
    try {
      const [results] = await database.execute(
        `SELECT l.*, u.name FROM monitor_targets l LEFT JOIN users u USING (user_id)`
      );
      return results;
    } catch (e) {
      console.error(e);
      return;
    }
  },
  setUserTargets: async (database, targetHours, date_start, date_end, userId) => {
    try {
      await database.execute(
        'INSERT INTO `monitor_targets` (user_id, date_start, date_end, target_hours) VALUES ( ? , ? , ? , ? )',
        [userId, date_start, date_end, targetHours]
      );

      const [results] = await database.execute(
        'SELECT * FROM monitor_targets WHERE id=LAST_INSERT_ID()'
      );

      return results[0];
    } catch (e) {
      return e.code;
    }
  },
  getOffDays: async (database) => {
    try {
      const [results] = await database.execute('SELECT * FROM `off_days`');

      return results;
    } catch (e) {
      return e.code;
    }
  },
  setOffDays: async (database, date) => {
    try {
      const [data] = await database.execute('SELECT * FROM `off_days`');

      if (data.length > 0) {
        for (const val of data) {
          if (new Date(val.date).toLocaleDateString() == new Date(date).toLocaleDateString()) {
            return val;
          }
        }
      }

      await database.execute('INSERT INTO `off_days` (date) VALUES ( ? )', [date]);

      const [results] = await database.execute('SELECT * FROM off_days WHERE id=LAST_INSERT_ID()');

      return results[0];
    } catch (e) {
      return e.code;
    }
  },
  deleteOffDay: async (database, id) => {
    try {
      const [results] = await database.execute('SELECT * FROM off_days WHERE id=?', [id]);
      if (results.length === 0) return false;
      await database.execute('DELETE FROM off_days WHERE id = ?', [id]);
      return true;
    } catch (e) {
      console.error(e);
    }
  },
};
