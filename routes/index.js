const express = require("express");

const { Register, addListWaitingFriend, rejectWaitingFriend, acceptWaitingFriend, getFriendProfile, updatePassword, updateProfil } = require("../controller/User");
require("../utils/auth");
const router = express.Router();
const passport = require("passport");
const { login, getUsers } = require("../handler");
const { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom, joinRoom } = require("../controller/Chats");
const { checkRoomPersonalChat, getPersonalChat, getAllPersonalChat, updateStatusPersonalChat, updateNotifStatusPersonalChat } = require("../controller/PersonalChat");
const { validateRegist, validatePassword, validateEvent } = require("../utils/validator");
const { addEvent } = require("../controller/Event");

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
router.put("/user/password", validatePassword, updatePassword);
router.put("/user/profil", updateProfil);

router.post("/chat/room/:iduser", checkRoomPersonalChat);
router.get("/chat/all/:iduser", getAllPersonalChat);
router.put("/chat/all/:idchat", updateStatusPersonalChat);
router.put("/chat/notifstatus/:idchat", updateNotifStatusPersonalChat);

router.post("/event/addevent", validateEvent, addEvent);

module.exports = router;
