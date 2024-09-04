const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const q = require("../db/queries");

const verifyCallback = async (username, password, done) => {
  try {
    const user = await q.getUserByUsername(username);
    if (!user) {
      return done(null, false);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return done(null, false, { message: "Incorrect Password" });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await q.getUserById(userId);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
