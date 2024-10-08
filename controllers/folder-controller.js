const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const q = require("../db/queries");

exports.add_folder_post = [
  body("folder_name", "must enter folder name")
    .trim()
    .escape()
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
      });
    }

    const folderExists = await q.getFolderByName(req.body.folder_name);
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

      res.redirect("/home");
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
  const folder = await q.getFolderByName(req.params.folder);
  const user = await q.getUserById(req.session.passport.user);
  res.render("folder-detail", {
    folders: folders,
    selectedFolder: folder,
    user: user,
  });
});

exports.selected_folder_update_get = asyncHandler(async (req, res, next) => {
  const folder = await q.getFolderByName(req.params.folder);
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
      const folder = await q.getFolderByName(req.params.folder);
      const user = await q.getUserById(req.session.passport.user);
      return res.render("folder-update", {
        errors: errors.array(),
        folder: folder,
        user: user,
      });
    }

    const folderExists = await q.getFolderByName(req.body.folder_name);
    console.log(folderExists);

    if (folderExists) {
      console.log("folder exists");
      const folder = await q.getFolderByName(req.params.folder);
      const user = await q.getUserById(req.session.passport.user);
      res.render("folder-update", {
        success: "",
        errors: [{ msg: "Folder with this name already exists" }],
        folder: folder,
        user: user,
      });
    } else {
      await q.updateFolder(req.params.folder, {
        name: req.body.folder_name,
      });

      res.redirect("/home/");
    }
  }),
];

// exports.selected_folder_delete_get;

exports.selected_folder_delete_post = asyncHandler(async (req, res, next) => {
  await q.deleteFolder(req.body.folder);
  res.redirect("/home/");
});
