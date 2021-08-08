const { asyncHandler } = require('../../middleware/requestHandler');
const { addUser, getUsers, updateUser } = require('./index');

module.exports = {
  init: (app) => {
    app.post('/users', asyncHandler(addUser));
    app.get('/users', asyncHandler(getUsers));
    app.put('/user/:id', asyncHandler(updateUser));
  },
};
