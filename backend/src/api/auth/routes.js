const { asyncHandler } = require('../../middleware/requestHandler');
const { loginFenix, userProfile } = require('./index');

module.exports = {
  init: (app) => {
    app.get('/api/auth/fenix', asyncHandler(loginFenix));
    app.get('/api/auth/profile', asyncHandler(userProfile));
  },
};
