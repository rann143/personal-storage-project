/* eslint-disable no-undef */
const asyncHandler = require("express-async-handler");
const q = require("../db/queries");
const cloudinary = require("cloudinary").v2;
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

exports.file_detail = asyncHandler(async (req, res, next) => {
  const folderId = parseInt(req.params.folderId);
  const file = await q.getFileDetail(req.params.fileName, folderId);

  res.render("file-detail", {
    file: file,
  });
});

exports.file_delete = asyncHandler(async (req, res, next) => {
  console.log(req.body.thisFile);
  const folderId = parseInt(req.params.folderId);
  await q.deleteFile(req.body.thisFile, folderId);
  res.redirect("/home");
});

exports.upload_file_to_folder_post = asyncHandler(async (req, res, next) => {
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

// Function use in upload_file_to_folder_post function
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
      uploadResult.public_id,
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
