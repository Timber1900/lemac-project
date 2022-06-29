const { asyncHandler } = require('../../middleware/requestHandler');
const { getHours } = require('./index');

module.exports = {
  init: (app) => {
    app.get('/roomhours', asyncHandler(getHours));
  },
};
