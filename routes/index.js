const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/user-controller");
const folderController = require("../controllers/folder-controller");
const fileController = require("../controllers/file-controller");
const multer = require("multer");
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100000000,
  },
});

// Index Route
router.get("/", function (req, res) {
  res.render("index", {});
});

// LOGIN & LOGOUT ROUTES
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

// SIGN UP ROUTES
router.get("/signup", function (req, res) {
  res.render("signup-form", {
    userInfo: {},
    errors: [],
  });
});

router.post("/signup", userController.user_create_post);

// HOME ROUTE
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

// UPLOAD FILE ROUTE (GET)
router.get("/home/:folder/:folderId/upload-file", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("uploadfile-form", {
      uploadSuccessful: "",
    });
  } else {
    res.send("You are not authenticated");
  }
});

// UPLOAD FILE ROUTE (POST)
router.post(
  "/home/:folder/:folderId/upload-file",
  upload.single("uploaded_file"),
  fileController.upload_file_to_folder_post,
);

// ADD FOLDER ROUTE (POST)
router.post("/home/:folder?/:folderId?", folderController.add_folder_post);

// SELECTED FOLDER ROUTE (GET)
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

// UPDATE FOLDER FORM PAGE (GET)
router.get(
  "/home/:folder/:folderId?/update",
  folderController.selected_folder_update_get,
);

// UPDATE FOLDER FORM PAGE (POST)
router.post(
  "/home/:folder/:folderId?/update",
  folderController.selected_folder_update_put,
);

// DELETE FOLDER ROUTE
router.post(
  "/home/:folder/:folderId?/delete",
  folderController.selected_folder_delete_post,
);

// FILE DETAIL ROUTE (GET)
router.get(
  "/home/:folder/:folderId?/:fileName?/details",
  fileController.file_detail,
);

// FILE DETAIL PAGE (DELETE POST)
router.post(
  "/home/:folder/:folderId?/:fileName?/details",
  fileController.file_delete,
);

// FILE DOWNLOAD ROUTE (GET)
router.get("/download/:fileName", fileController.download_file_get);

module.exports = router;
