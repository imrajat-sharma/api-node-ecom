const express = require("express");
const app = express();
const cors = require("cors");
const AppError = require("./utils/appError");
const errorHandler = require("./middlewares/error.middleware");
const productRoutes = require("./routes/product.route");

// Security middleware
app.use(express.json({ limit: "10kb" })); // Limit request body size

// CORS and security headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  // Security headers
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");

  next();
});

// API routes
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("E-commerce Backend API is running");
});

// 404 handler - must come after all routes
app.use((req, res, next) => {
  return next(new AppError("Route not found", 404));
});

// Global error handling middleware - must be last
app.use(errorHandler);

module.exports = app;
