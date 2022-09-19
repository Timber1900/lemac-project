const { asyncHandler } = require('../../middleware/requestHandler');
const { addUser, getUsers, updateUser, deleteUser } = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/users', asyncHandler(addUser));
    app.get('/api/users', asyncHandler(getUsers));
    app.put('/api/users/:id', asyncHandler(updateUser));
    app.delete('/api/users/:id', asyncHandler(deleteUser));
  },
};
