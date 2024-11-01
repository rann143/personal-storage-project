const RateLimit = require("express-rate-limit");

const authLimiter = RateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  message: {
    error: "Too many login attempts. Please try again after 10 minutes.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    error: "Unauthorized",
    message: "You must be logged in to view this resource",
  });
};

module.exports = {
  checkAuthenticated,
  authLimiter,
};
