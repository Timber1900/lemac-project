module.exports = {
  getLemacUserData: async (database, mifare_id) => {
    try {
      const [results] = await database.execute('SELECT * FROM lemac_users WHERE mifare_id=?', [mifare_id]);
      return results[0];
    } catch (e) {
      console.error(e);
      return;
    }
  },
  getLemacUsersData: async (database) => {
    try {
      const [results] = await database.execute('SELECT * FROM lemac_users');
      return results;
    } catch (e) {
      console.error(e);
      return;
    }
  },
  createUser: async (database, mifare_id, name, ist_id, email, course) => {
    try {
      await database.execute('INSERT INTO `lemac_users` (mifare_id,  name, ist_id, state, email, course) VALUES ( ? , ? , ? , ? , ? , ?)', [
        mifare_id,
        name,
        ist_id,
        "offline",
        email,
        course
      ]);
      const [results] = await database.execute('SELECT * FROM lemac_users WHERE id=LAST_INSERT_ID()');
      return results[0];
    } catch (e) {
      console.error(e);
      return;
    }
  },
  changeUserState: async (database, state, user_id) => {
    try {
      await database.execute('UPDATE lemac_users SET state = ?, last_modified = (now()) WHERE id = ?', [
        state,
        user_id,
      ]);
      const [results] = await database.execute('SELECT * FROM lemac_users WHERE id=?', [user_id]);

      return results[0];
    } catch (e) {
      console.error(e);
    }
  }
}
