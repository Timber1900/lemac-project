const { asyncHandler } = require('../../middleware/requestHandler');
const { createEvent, editEvent, getEvents, deleteEvents } = require('./index');

module.exports = {
  init: (app) => {
    app.get('/schedule', asyncHandler(getEvents));
    app.post('/schedule', asyncHandler(createEvent));
    app.put('/schedule/:id', asyncHandler(editEvent));
    app.delete('/schedule/:id', asyncHandler(deleteEvents));
  },
};
