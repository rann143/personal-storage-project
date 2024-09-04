const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const createError = require("http-errors");
const path = require("path");
const passport = require("passport");
const indexRouter = require("./routes/index");
const q = require("./db/queries");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    // eslint-disable-next-line no-undef
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(q.prisma, {
      checkPeriod: 2 * 60 * 1000, // ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
  }),
);

require("./auth-config/passport");
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);

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

// eslint-disable-next-line no-undef
const port = process.env.PORT;
app.listen(port, () => console.log(`Listening on port ${port}`));
