const { asyncHandler } = require('../../middleware/requestHandler');
const {
  addWorkstation,
  getWorkstations,
  updateWorkstation,
  deleteWorkstation,
} = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/workstations', asyncHandler(addWorkstation));
    app.get('/api/workstations', asyncHandler(getWorkstations));
    app.put('/api/workstations/:id', asyncHandler(updateWorkstation));
    app.delete('/api/workstations/:id', asyncHandler(deleteWorkstation));
  },
};
