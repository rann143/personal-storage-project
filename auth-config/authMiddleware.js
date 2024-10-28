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
};
