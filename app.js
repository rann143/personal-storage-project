const express = require("express");
const session = require("express-session");
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const createError = require("http-errors");
const path = require("path");
const passport = require("passport");
const indexRouter = require("./routes/index");
const q = require("./db/queries");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();
// Need to require the entire Passport config module so app.js knows about it
require("./auth-config/passport");

const app = express();

app.use(helmet());

app.use(compression());

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// VIEWS
// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// SESSION SETUP FOR LOGIN
const sessionStore = new PrismaSessionStore(q.prisma, {
  checkPeriod: 2 * 60 * 1000, // ms
  dbRecordIdIsSessionId: true,
  dbRecordIdFunction: undefined,
});

app.use(
  session({
    // eslint-disable-next-line no-undef
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
  }),
);

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// Configure Cloudinary
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ROUTES
app.use("/", indexRouter);

// Access uploaded files
app.use(
  "/uploads/:filename",
  //express.static(path.join(__dirname, "uploads")),
  function (req, res, next) {
    const filepath = path.join(__dirname, "uploads", req.params.filename);
    res.sendFile(filepath);
  },
);

// ERROR HANDLING
app.use(function (req, res, next) {
  // set locals, only providing error in development
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render error.ejs page
  res.status(err.status || 500);
  res.render("error");
});

// SET PORT
// eslint-disable-next-line no-undef
const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));
