const express = require("express");
const path = require("path");
const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/user-controller");
const folderController = require("../controllers/folder-controller");
const multer = require("multer");
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100000000,
  },
});
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

router.get("/home/:folder/:folderId/upload-file", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("uploadfile-form", {
      uploadSuccessful: "",
    });
  } else {
    res.send("You are not authenticated");
  }
});

router.post(
  "/home/:folder/:folderId/upload-file",
  upload.single("uploaded_file"),
  folderController.upload_to_folder_post,
);

router.post("/home/:folder?/:folderId?", folderController.add_folder_post);

router.get(
  "/home/:folder?/:folderId?",
  function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.send("You are not authenticated");
    }
  },
  folderController.selected_folder_get,
);

router.get(
  "/home/:folder/:folderId?/update",
  folderController.selected_folder_update_get,
);

router.post(
  "/home/:folder/:folderId?/update",
  folderController.selected_folder_update_put,
);

router.post(
  "/home/:folder/:folderId?/delete",
  folderController.selected_folder_delete_post,
);

router.get(
  "/home/:folder/:folderId?/:fileName?/details",
  folderController.file_detail,
);

router.post(
  "/home/:folder/:folderId?/:fileName?/details",
  folderController.file_delete,
);

router.get("/download/:fileName", folderController.download_file_get);

module.exports = router;
