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
  const currentFile = await q.getFileDetail(req.body.thisFile, folderId);

  // Remove from cloudinary
  await cloudinary.uploader.destroy(currentFile.publicId, { invalidate: true });

  //Remove from database
  await q.deleteFile(req.body.thisFile, folderId);
  // res.status(200).json({ message: "File deleted successfully" });
  res.redirect(`/home/${req.params.folder}/${req.params.folderId}`);
});

exports.upload_file_form_get = asyncHandler(async (req, res, next) => {
  const folder = await q.getFolderByUniqueConstraint(
    req.params.folder,
    req.session.passport.user,
  );

  res.render("uploadfile-form", {
    uploadSuccessful: "",
    folder: folder,
  });
});

exports.upload_file_to_folder_post = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.send("Select a file to submit");
  }

  const fileExists = await q.getFileDetail(
    req.file.originalname,
    req.params.folderId,
  );
  if (fileExists) {
    return res.send("This folder already contains a file with this name");
  }

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

  try {
    const uploadResult = await cloudinary.uploader.upload(filepath);
    try {
      const currentTime = new Date().toLocaleString();
      const newFile = await q.createFile(
        fileName,
        uploadResult.secure_url,
        uploadResult.bytes,
        uploadResult.public_id,
        currentTime,
        folder,
      );
      return newFile;
    } catch (databaseError) {
      // If database upload fails, delete the uploaded file from Cloudinary
      await cloudinary.uploader.destroy(uploadResult.public_id);
      console.log("Cleaned up Cloudinary file after error:", databaseError);
      throw databaseError; // Re-throw the error to handle it upstream
    }
  } catch (error) {
    console.log(error);
    throw error;
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
