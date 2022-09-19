const { asyncHandler } = require('../../middleware/requestHandler');
const { addEntries, deleteEntrie, updateEntrie, getEntries } = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/entries', asyncHandler(addEntries));
    app.delete('/api/entries/:id', asyncHandler(deleteEntrie));
    app.put('/api/entries/:id', asyncHandler(updateEntrie));
    app.get('/api/entries', asyncHandler(getEntries));
  },
};
