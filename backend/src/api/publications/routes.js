const { asyncHandler } = require('../../middleware/requestHandler');
const {
  addPublication,
  deletePublication,
  updatePublications,
  getPublications,
} = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/publication', asyncHandler(addPublication));
    app.get('/api/publication', asyncHandler(getPublications));
    app.put('/api/publication/:id', asyncHandler(updatePublications));
    app.delete('/api/publication/:id', asyncHandler(deletePublication));
  },
};
