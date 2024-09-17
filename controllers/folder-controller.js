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
      return res.render("home", {
        folderInfo: folderInfo,
        errors: errors.array(),
      });
    }

    const folderExists = await q.getFolderByName(req.body.folder_name);
    console.log(folderExists);

    if (folderExists) {
      console.log("folder exists");
      res.render("home", {
        success: "",
        folderInfo: {},
        errors: [{ msg: "Folder with this name already exists" }],
      });
    } else {
      await q.createFolder(req.body.folder_name, req.session.passport.user);
      res.render("home", {
        folderInfo: {},
        success: `'${req.body.folder_name}' folder added!`,
        errors: [],
      });
    }
  }),
];
