const axios = require('axios');

module.exports = {
  getRoomData: async (roomCode, date) => {
    const { data: response } = await axios.get(
      `https://fenix.tecnico.ulisboa.pt/api/fenix/v1/spaces/${roomCode}?day=${date}`
    );

    return response;
  },
};
