const { asyncHandlerEntrances, asyncHandler } = require('../../middleware/requestHandler');
const {
  handleEntrance,
  createUser,
  getLemacUserData,
  changeUserState,
  getLemacUsersData
} = require('./index');

module.exports = {
  init: (app, ws_server) => {
    app.post('/api/entrances', asyncHandlerEntrances(handleEntrance, ws_server));
    app.get('/api/entrances/:mifare_id', asyncHandler(getLemacUserData)),
    app.get('/api/entrances', asyncHandler(getLemacUsersData)),
    app.post('/api/entrances/create_user', asyncHandler(createUser)),
    app.put('/api/entrances', asyncHandler(changeUserState))
  },
};
