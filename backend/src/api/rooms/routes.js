const { asyncHandler } = require('../../middleware/requestHandler');
const { getHours, addHours, deleteHours, updateHours } = require('./index');
const { getHoursFenix } = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/room-hours/fenix', asyncHandler(getHoursFenix));
    app.get('/api/room-hours', asyncHandler(getHours));
    app.post('/api/room-hours', asyncHandler(addHours));
    app.delete('/api/room-hours/:id', asyncHandler(deleteHours));
    app.put('/api/room-hours/:id', asyncHandler(updateHours));
  },
};
