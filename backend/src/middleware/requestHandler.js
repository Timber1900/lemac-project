const errorHandler = (err, _req, res, next) => {
  if (!err) return next();

  console.error(err);
  res.sendStatus(500);
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const asyncHandlerEntrances = (fn, ws_server) => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, ws_server, next)).catch(next)
  }
};

module.exports = {
  asyncHandler,
  errorHandler,
  asyncHandlerEntrances
};
