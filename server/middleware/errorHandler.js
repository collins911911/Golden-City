// 404 for unknown API routes
const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// One place that turns every error into a clean JSON message.
// Express 5 sends errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status  = err.status || err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again.';

  if (err.name === 'CastError') {              // bad MongoDB id in the URL
    status = 400; message = 'Invalid ID.';
  } else if (err.name === 'ValidationError') { // mongoose schema validation
    status = 400; message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {             // duplicate unique field
    status = 409; message = 'This record already exists.';
  } else if (err.type === 'entity.too.large') {
    status = 413; message = 'Request is too large.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Invalid JSON.';
  }

  if (status >= 500) console.error('❌', req.method, req.originalUrl, '-', err.stack || err.message);
  res.status(status).json({ message: status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Something went wrong. Please try again.'
    : message });
};

module.exports = { notFound, errorHandler };
