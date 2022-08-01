const jwt = require("jsonwebtoken");
const passport = require("passport");
const UserTestSaika = require("./model/User");

const login = async (req, res, next) => {
  passport.authenticate("login", async (err, userSaika, info) => {
    try {
      if (err || !userSaika) {
        const error = new Error("Password atau Email salah");
        res.send(info);
        return next(error);
      } else {
        req.login(userSaika, { session: false }, async (error) => {
          if (error) return next(error);
          const body = { _id: userSaika._id, email: userSaika.email };
          const token = jwt.sign(body, "saikas3cret");
          return res.json({ user: body, token });
        });
      }
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};
const getUsers = async (req, res) => {
  const user = await UserTestSaika.findOne({ _id: Object(req.params.id) });
  if (user) {
    res.send(user);
  }
  // console.log(user);
};

module.exports = { login, getUsers };
