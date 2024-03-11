const { asyncHandler } = require('../../middleware/requestHandler');
const { createEvent, editEvent, getEvents, deleteEvents } = require('./index');

module.exports = {
  init: (app) => {
    app.get('/api/room-events', asyncHandler(getEvents));
    app.post('/api/room-events', asyncHandler(createEvent));
    app.put('/api/room-events/:id', asyncHandler(editEvent));
    app.delete('/api/room-events/:id', asyncHandler(deleteEvents));
  },
};
