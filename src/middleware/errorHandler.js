function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
}

// Route params such as :id must be positive integers.
function validateIdParam(req, res, next, value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return res.status(400).json({ error: `"${value}" is not a valid id. Ids are positive integers.` });
  }
  next();
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { notFoundHandler, validateIdParam, errorHandler };
