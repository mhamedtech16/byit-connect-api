function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  // لو الخطأ من Mongoose (validation, casting..)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // لو فيه status مخصص من الخطأ نفسه
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
