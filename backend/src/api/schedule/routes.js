const { asyncHandler } = require('../../middleware/requestHandler');
const {
  createEvent,
  editEvent,
  getEvents,
  deleteEvents,
  getUserTargets,
  setUserTarget,
} = require('./index');

module.exports = {
  init: (app) => {
    app.get('/schedule', asyncHandler(getEvents));
    app.post('/schedule', asyncHandler(createEvent));
    app.put('/schedule/:id', asyncHandler(editEvent));
    app.delete('/schedule/:id', asyncHandler(deleteEvents));
    app.post('/schedule/targets', asyncHandler(setUserTarget));
    app.get('/schedule/targets', asyncHandler(getUserTargets));
  },
};
