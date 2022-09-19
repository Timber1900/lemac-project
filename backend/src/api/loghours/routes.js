const { asyncHandler } = require('../../middleware/requestHandler');
const {
  addHours,
  getHours,
  getIndividualHours,
  deleteHours,
  updateHours,
  getSum,
  lastEntry,
} = require('./index');

module.exports = {
  init: (app) => {
    app.post('/api/loghours', asyncHandler(addHours));
    app.get('/api/loghours', asyncHandler(getHours));
    app.get('/api/loghours/self', asyncHandler(getIndividualHours));
    app.put('/api/loghours/:id', asyncHandler(updateHours));
    app.delete('/api/loghours/:id', asyncHandler(deleteHours));
    app.get('/api/loghours/sum', asyncHandler(getSum));
    app.get('/api/loghours/lastEntry', asyncHandler(lastEntry));
  },
};
