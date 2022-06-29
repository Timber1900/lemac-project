const services = require('./services');

module.exports = {
  getHours: async (database, month, year, roomId) => {
    try {
      let data = await services.getRoomData(roomId);

      return data;
    } catch (e) {
      console.error(e);
      return;
    }
  },
};
