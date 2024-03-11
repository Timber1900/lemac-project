const { asyncHandler } = require('../../middleware/requestHandler');
const {
  createEvent,
  editEvent,
  getEvents,
  deleteEvents,
  getUserTargets,
  setUserTarget,
  getOffDays,
  setOffDay,
  deleteOffDay,
  editUserTarget,
  deleteTarget,
} = require('./index');

module.exports = {
  init: (app) => {
    app.get('/api/schedule', asyncHandler(getEvents));
    app.post('/api/schedule', asyncHandler(createEvent));
    app.put('/api/schedule/:id', asyncHandler(editEvent));
    app.delete('/api/schedule/:id', asyncHandler(deleteEvents));
    app.post('/api/schedule/targets', asyncHandler(setUserTarget));
    app.put('/api/schedule/targets/:id', asyncHandler(editUserTarget));
    app.delete('/api/schedule/targets/:id', asyncHandler(deleteTarget));
    app.get('/api/schedule/targets', asyncHandler(getUserTargets));
    app.get('/api/schedule/off_days', asyncHandler(getOffDays));
    app.post('/api/schedule/off_days', asyncHandler(setOffDay));
    app.delete('/api/schedule/off_days/:id', asyncHandler(deleteOffDay));
  },
};
