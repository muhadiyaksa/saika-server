const express = require("express");

const { body, check } = require("express-validator");
const { Register, addListWaitingFriend } = require("../controller/User");
const UserTestSaika = require("../model/User");
require("../utils/auth");
const router = express.Router();
const passport = require("passport");
const { login, getUsers } = require("../handler");
const { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom } = require("../controller/Chats");
router.post(
  "/register",
  [
    body("email").custom(async (value) => {
      const duplikat = await UserTestSaika.findOne({ email: value });
      if (duplikat) {
        throw new Error("Email Sudah Pernah DiDaftarkan!");
      }
      return true;
    }),
    check("email", "Email tidak Valid!").isEmail(),
    check("password").isLength({ min: 8 }).withMessage("Password Minimal Karakter adalah 8").matches(/\d/).withMessage("Password Harus Berisi Nomor"),
    body("konfirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Konfirmasi Password tidak sama dengan Password Utama");
      }
      return true;
    }),
  ],
  Register
);

router.post("/login", login);
router.get("/user/:id", passport.authenticate("jwt", { session: false }), getUsers);
router.post("/chats", buatRoom);
router.delete("/chat/:idroom", passport.authenticate("jwt", { session: false }), hapusRoom);
router.get("/chats_detail/:idroom", passport.authenticate("jwt", { session: false }), getRoom);
router.put("/chats_detail/:idroom", passport.authenticate("jwt", { session: false }), keluarRoom);

router.put("/user/friend/:iduser", addListWaitingFriend);
module.exports = router;
