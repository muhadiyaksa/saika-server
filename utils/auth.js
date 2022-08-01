const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const UserTestSaika = require("../model/User");

require("./db");

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const userSaika = await UserTestSaika.findOne({ email: email });
        if (!userSaika) {
          return done(null, false, { message: "Email tidak terdaftar" });
        }
        const validate = await bcrypt.compare(password, userSaika.konfirmPassword);
        if (!validate) {
          return done(null, false, { message: "Password Salah!" });
        }
        return done(null, userSaika, { message: "Login Berhasil" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "saikas3cret",
    },
    async (payload, done) => {
      try {
        const userSaika = await UserTestSaika.findOne({ _id: Object(payload._id) });
        if (userSaika) {
          return done(null, userSaika);
        }

        return done(null, false);
      } catch (error) {
        return done(error);
      }
    }
  )
);
