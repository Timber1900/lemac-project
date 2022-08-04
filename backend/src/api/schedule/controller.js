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
      const [results] = await database.execute('SELECT * FROM room_events WHERE id= ?', [id]);
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
};
