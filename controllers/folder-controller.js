/* eslint-disable no-undef */
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const q = require("../db/queries");
const cloudinary = require("cloudinary").v2;
const https = require("https");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

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
  await q.deleteFolder(req.body.folder, req.session.passport.user);
  res.redirect("/home");
});

exports.file_detail = asyncHandler(async (req, res, next) => {
  res.send("GET route incomplete - will get file details");
});

exports.file_delete = asyncHandler(async (req, res, next) => {
  console.log(req.body.thisFile);
  await q.deleteFile(req.body.thisFile, req.params.folderId);
  res.redirect("/home");
});

exports.upload_to_folder_post = asyncHandler(async (req, res, next) => {
  console.log(req.file);
  if (req.file.path || req.file.path !== "undefined") {
    await uploadFile(req.file.path, req.params.folderId, req.file.originalname);
  } else {
    console.error("No file found");
    res.render("uploadfile-form", {
      uploadSuccessful: "An Error Occured With Your Upload",
    });
  }

  res.redirect(`/home/${req.params.folder}/${req.params.folderId}`);
});

async function uploadFile(filepath, folderId, fileName) {
  const folder = Number(folderId);
  // Config
  cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath);
    const currentTime = new Date().toLocaleString();
    const newFile = await q.createFile(
      fileName,
      uploadResult.secure_url,
      uploadResult.bytes,
      currentTime,
      folder,
    );
    console.log(uploadResult);
    console.log(newFile);
  } catch (error) {
    console.log(error);
  }
}

exports.download_file_get = asyncHandler(async (req, res, next) => {
  const fileUrl = req.query.myFile;

  // Validate the input URL
  if (!fileUrl) {
    return res.status(400).send("URL parameter is required");
  }

  const filePath = path.join(__dirname, req.params.fileName);
  const file = fs.createWriteStream(filePath);

  // Send a GET request to download the image
  https
    .get(fileUrl, (response) => {
      if (response.statusCode !== 200) {
        res
          .status(response.statusCode)
          .send(`Failed to download file: ${response.statusMessage}`);
        return;
      }

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        res.download(filePath, req.params.fileName, (err) => {
          if (err) {
            console.error("Error downloading the file:", err);
          } else {
            console.log(`Download Completed: ${req.params.fileName}`);
          }
        });
      });
    })
    .on("error", (err) => {
      console.error("Error during HTTP request:", err);
      res.status(500).send("Error downloading the file");
    });

  file.on("error", (err) => {
    console.error(`Error writing to file: ${err.message}`);
    fs.unlink(filePath, () => {});
  });
});
