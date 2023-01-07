const express = require("express");

const { Register, addListWaitingFriend, rejectWaitingFriend, acceptWaitingFriend, getFriendProfile, updatePassword, updateProfil, sendUniqueCode, checkUniqueCode, resetPassword } = require("../controller/User");
require("../utils/auth");
const router = express.Router();
const passport = require("passport");
const { login, getUsers } = require("../handler");
const { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom, joinRoom } = require("../controller/Chats");
const { checkRoomPersonalChat, getPersonalChat, getAllPersonalChat, updateStatusPersonalChat, updateNotifStatusPersonalChat } = require("../controller/PersonalChat");
const { validateRegist, validatePassword, validateEvent, validateUniqueCode, validateEmailForUniqueCode, validateResetPassword } = require("../utils/validator");
const { addEvent, getEvent } = require("../controller/Event");

router.post("/register", validateRegist, Register);
router.post("/login", login);
router.get("/user/:id", passport.authenticate("jwt", { session: false }), getUsers);
router.post("/chats", buatRoom);
router.delete("/chat/:idroom", passport.authenticate("jwt", { session: false }), hapusRoom);
router.get("/chats_detail/:idroom", passport.authenticate("jwt", { session: false }), getRoom);
router.put("/chats_detail/:idroom", passport.authenticate("jwt", { session: false }), keluarRoom);
router.post("/rejoinchats/:idroom", passport.authenticate("jwt", { session: false }), joinRoom);

router.put("/user/friend/:iduser", addListWaitingFriend);
router.put("/user/reject-friend/:iduser", rejectWaitingFriend);
router.put("/user/accept-friend/:iduser", acceptWaitingFriend);
router.get("/user/friend/:iduser", getFriendProfile);
router.put("/user/password", validatePassword, passport.authenticate("jwt", { session: false }), updatePassword);
router.put("/user/senduniquecode", validateEmailForUniqueCode, sendUniqueCode);
router.put("/user/validateuniquecode", validateUniqueCode, checkUniqueCode);
router.put("/user/resetpassword", validateResetPassword, resetPassword);
router.put("/user/profil", passport.authenticate("jwt", { session: false }), updateProfil);

router.post("/chat/room/:iduser", checkRoomPersonalChat);
router.get("/chat/all/:iduser", getAllPersonalChat);
router.put("/chat/all/:idchat", updateStatusPersonalChat);
router.put("/chat/notifstatus/:idchat", updateNotifStatusPersonalChat);

router.get("/event/:type", getEvent);
router.post("/event/addevent", validateEvent, addEvent);

module.exports = router;
