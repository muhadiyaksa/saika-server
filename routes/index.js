const express = require("express");

const { body, check } = require("express-validator");
const { Register, addListWaitingFriend, rejectWaitingFriend, acceptWaitingFriend, getFriendProfile } = require("../controller/User");
const UserTestSaika = require("../model/User");
require("../utils/auth");
const router = express.Router();
const passport = require("passport");
const { login, getUsers } = require("../handler");
const { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom } = require("../controller/Chats");
const { checkRoomPersonalChat, getPersonalChat, getAllPersonalChat, updateStatusPersonalChat, updateNotifStatusPersonalChat } = require("../controller/PersonalChat");
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
router.put("/user/reject-friend/:iduser", rejectWaitingFriend);
router.put("/user/accept-friend/:iduser", acceptWaitingFriend);
router.get("/user/friend/:iduser", getFriendProfile);

router.post("/chat/room/:iduser", checkRoomPersonalChat);
router.get("/chat/all/:iduser", getAllPersonalChat);
router.put("/chat/all/:idchat", updateStatusPersonalChat);
router.put("/chat/notifstatus/:idchat", updateNotifStatusPersonalChat);
module.exports = router;
