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
} = require('./index');

module.exports = {
  init: (app) => {
    app.get('/schedule', asyncHandler(getEvents));
    app.post('/schedule', asyncHandler(createEvent));
    app.put('/schedule/:id', asyncHandler(editEvent));
    app.delete('/schedule/:id', asyncHandler(deleteEvents));
    app.post('/schedule/targets', asyncHandler(setUserTarget));
    app.get('/schedule/targets', asyncHandler(getUserTargets));
    app.get('/schedule/off_days', asyncHandler(getOffDays));
    app.post('/schedule/off_days', asyncHandler(setOffDay));
    app.delete('/schedule/off_days/:id', asyncHandler(deleteOffDay));
  },
};
