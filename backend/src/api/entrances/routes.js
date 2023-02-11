const { asyncHandlerEntrances } = require('../../middleware/requestHandler');
const {
  handleEntrance,
} = require('./index');

module.exports = {
  init: (app, ws_server) => {
    app.post('/api/entrances', asyncHandlerEntrances(handleEntrance, ws_server));


  },
};
