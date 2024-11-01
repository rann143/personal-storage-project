const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const q = require("../db/queries");

require("dotenv").config();

exports.add_folder_post = [
  body("folder_name", "must enter folder name")
    .trim()
    .escape()
    .isAlphanumeric()
    .isLength({ min: 1 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const folderInfo = {
      folder_name: req.body.folder_name,
    };

    if (!errors.isEmpty()) {
      const folders = await q.getAllFoldersForUser(req.session.passport.user);
      const user = await q.getUserById(req.session.passport.user);
      return res.render("home", {
        folderInfo: folderInfo,
        errors: errors.array(),
        folders: folders,
        user: user,
        success: "",
      });
    }

    const folderExists = await q.getFolderByUniqueConstraint(
      req.body.folder_name,
      req.session.passport.user,
    );
    console.log(folderExists);

    if (folderExists) {
      console.log("folder exists");
      const folders = await q.getAllFoldersForUser(req.session.passport.user);
      const user = await q.getUserById(req.session.passport.user);
      res.render("home", {
        success: "",
        folderInfo: {},
        errors: [{ msg: "Folder with this name already exists" }],
        folders: folders,
        user: user,
      });
    } else {
      await q.createFolder(req.body.folder_name, req.session.passport.user);

      res.redirect("/home/");
    }
  }),
];

exports.get_all_folders = asyncHandler(async (req, res, next) => {
  const folders = await q.getAllFoldersForUser(req.session.passport.user);
  const user = await q.getUserById(req.session.passport.user);

  res.render("home", {
    success: "",
    errors: [],
    folders: folders,
    user: user,
  });
});

exports.selected_folder_get = asyncHandler(async (req, res, next) => {
  const folders = await q.getAllFoldersForUser(req.session.passport.user);
  const folder = await q.getFolderByUniqueConstraint(
    req.params.folder,
    req.session.passport.user,
  );
  const user = await q.getUserById(req.session.passport.user);
  const files = await q.getAllFilesInFolder(req.params.folderId);
  res.render("folder-detail", {
    folders: folders,
    selectedFolder: folder,
    user: user,
    files: files,
  });
});

exports.selected_folder_update_get = asyncHandler(async (req, res, next) => {
  const folder = await q.getFolderByUniqueConstraint(
    req.params.folder,
    req.session.passport.user,
  );
  const user = await q.getUserById(req.session.passport.user);

  res.render("folder-update", {
    folder: folder,
    user: user,
  });
});

exports.selected_folder_update_put = [
  body("folder_name", "must enter folder name")
    .trim()
    .escape()
    .isLength({ min: 1 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const folder = await q.getFolderByUniqueConstraint(
        req.params.folder,
        req.session.passport.user,
      );
      const user = await q.getUserById(req.session.passport.user);
      return res.render("folder-update", {
        errors: errors.array(),
        folder: folder,
        user: user,
      });
    }

    const folderExists = await q.getFolderByUniqueConstraint(
      req.body.folder_name,
      req.session.passport.user,
    );
    console.log(folderExists);

    if (folderExists) {
      console.log("folder exists");
      const folder = await q.getFolderByUniqueConstraint(
        req.params.folder,
        req.session.passport.user,
      );
      const user = await q.getUserById(req.session.passport.user);
      res.render("folder-update", {
        success: "",
        errors: [{ msg: "Folder with this name already exists" }],
        folder: folder,
        user: user,
      });
    } else {
      await q.updateFolder(req.params.folder, req.session.passport.user, {
        name: req.body.folder_name,
      });

      res.redirect("/home/");
    }
  }),
];

exports.selected_folder_delete_post = asyncHandler(async (req, res, next) => {
  console.log(req.body.folder);
  const filesInFolder = await q.getAllFilesInFolder(req.params.folderId);
  console.log(filesInFolder);
  if (filesInFolder.length) {
    res.json({ message: "Must remove files before deleting folder" });
  } else {
    await q.deleteFolder(req.body.folder, req.session.passport.user);
    res.redirect("/home");
  }
});
