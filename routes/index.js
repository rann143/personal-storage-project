const express = require("express");
const path = require("path");
const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/user-controller");
const folderController = require("../controllers/folder-controller");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const q = require("../db/queries");

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

router.get(
  "/home",
  function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.send("You are not authenticated");
    }
  },
  folderController.get_all_folders,
);

router.get("/home/:folder/upload-file", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("uploadfile-form", {
      uploadSuccessful: "",
    });
  } else {
    res.send("You are not authenticated");
  }
});

router.post(
  "/home/:folder/upload-file",
  upload.single("uploaded_file"),
  function (req, res, next) {
    console.log("Upload successful:");
    console.log(req.file);
    res.render("uploadfile-form", {
      uploadSuccessful: "Upload Sucessful, Select a file to upload another",
    });
  },
);

router.post("/home/:folder", folderController.add_folder_post);

router.get(
  "/home/:folder?",
  function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.send("You are not authenticated");
    }
  },
  folderController.selected_folder_get,
);

router.get("/home/:folder/update", folderController.selected_folder_update_get);

router.post(
  "/home/:folder/update",
  folderController.selected_folder_update_put,
);

// router.get("/home/:folder/delete", );

router.post(
  "/home/:folder/delete",
  folderController.selected_folder_delete_post,
);

module.exports = router;
