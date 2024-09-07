const express = require("express");
const path = require("path");
const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/user-controller");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
    successRedirect: "/home",
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

// JUST PLACEHOLDER FOR SETUP
// router.get("/protected-route", function (req, res) {
//   if (req.isAuthenticated()) {
//     res.render("protected-route");
//   } else {
//     res.send("You are not authenticated");
//   }
// });

router.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home", {});
  } else {
    res.send("You are not authenticated");
  }
});

router.get("/upload-file", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("uploadfile-form");
  } else {
    res.send("You are not authenticated");
  }
});

router.post(
  "/upload-file",
  upload.single("uploaded_file"),
  function (req, res, next) {
    console.log(req.file);
    res.send("Upload successful");
  },
);

router.get(
  "/uploads/:filename",
  // express.static(path.join(__dirname, "../uploads")),
  function (req, res, next) {
    const filepath = path.join(
      "/Users/danielroderman/Desktop/Odin2/personal-storage-project/",
      "uploads",
      req.params.filename,
    );
    res.sendFile(filepath);
  },
);

module.exports = router;
