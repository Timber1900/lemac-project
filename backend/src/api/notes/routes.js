const { asyncHandler } = require('../../middleware/requestHandler');
const { addNotes, updateNotes, getNotes, deleteNote } = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/notes', asyncHandler(addNotes));
    app.put('/api/notes/:id', asyncHandler(updateNotes));
    app.get('/api/notes', asyncHandler(getNotes));
    app.delete('/api/notes/:id', asyncHandler(deleteNote));
  },
};
