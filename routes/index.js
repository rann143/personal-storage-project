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

router.get("/home", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("home", {});
  } else {
    res.send("You are not authenticated");
  }
});

router.get("/upload-file", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("uploadfile-form", {
      uploadSuccessful: "",
    });
  } else {
    res.send("You are not authenticated");
  }
});

router.post(
  "/upload-file",
  upload.single("uploaded_file"),
  function (req, res, next) {
    console.log("Upload successful:");
    console.log(req.file);
    res.render("uploadfile-form", {
      uploadSuccessful: "Upload Sucessful, Select a file to upload another",
    });
  },
);

module.exports = router;
