const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/user-controller");

router.get("/", function (req, res) {
  res.render("index", {});
});

router.get("/login", function (req, res) {
  res.render("login-form", {});
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/protected-route",
  }),
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

router.get("/signup", function (req, res) {
  res.render("signup-form", {
    userInfo: {},
    errors: [],
  });
});

router.post("/signup", userController.user_create_post);

router.get("/protected-route", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("protected-route");
  } else {
    res.send("You are not authenticated");
  }
});

module.exports = router;
