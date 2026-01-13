const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  const statusCode = err.statusCode || 500;

  // Log error details in development mode
  if (isDevelopment) {
    console.error("ERROR 💥", err.message);
  }

  // Don't leak error details in production
  const message = isDevelopment
    ? err.message
    : statusCode === 500
    ? "Internal Server Error"
    : err.message;

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
