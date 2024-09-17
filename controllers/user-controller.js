const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const q = require("../db/queries");

exports.user_create_post = [
  body("username", "must enter username")
    .trim()
    .escape()
    .isLength({ min: 1 })
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("password", "Must enter a password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters")
    .escape(),
  body("confirm-password", "must confirm password. Cannot be empty")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const userInfo = {
      username: req.body.username,
    };

    if (!errors.isEmpty()) {
      return res.render("signup-form", {
        userInfo: userInfo,
        errors: errors.array(),
      });
    }

    const usernameExists = await q.getUserByUsername(req.body.username);
    console.log(usernameExists);

    if (usernameExists) {
      console.log("username exists");
      res.render("signup-form", {
        userInfo: {},
        errors: [{ msg: "Username Taken" }],
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }

        await q.createUser(req.body.username, hashedPassword);
        res.redirect("/login");
      });
    }
  }),
];
