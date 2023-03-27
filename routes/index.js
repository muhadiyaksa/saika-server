require("../utils/auth");
const express = require("express");
const router = express.Router();
const passport = require("passport");

const { login, getUsers } = require("../handler");
const { Register, addListWaitingFriend, rejectWaitingFriend, acceptWaitingFriend, getFriendProfile, updatePassword, updateProfil, sendUniqueCode, checkUniqueCode, resetPassword } = require("../controller/User");
const { buatRoom, hapusRoom, getRoom, keluarRoom, joinRoom } = require("../controller/Chats");
const { checkRoomPersonalChat, getAllPersonalChatV2, getListWaitingFriendV2 } = require("../controller/PersonalChat");
const { addEvent, getEvent } = require("../controller/Event");

const { validateRegist, validatePassword, validateEvent, validateUniqueCode, validateEmailForUniqueCode, validateResetPassword } = require("../utils/validator");

// ROUTER USER DATA
router.post("/register", validateRegist, Register);
router.post("/login", login);
router.get("/user/:id", passport.authenticate("jwt", { session: false }), getUsers);

// ROUTER CHAT ROOM
router.post("/chats", buatRoom);
router.delete("/chat/:idroom", passport.authenticate("jwt", { session: false }), hapusRoom);
// router.get("/chats_detail_anony/:idroom", getRoomAnonymous);
router.get("/chats_detail/:idroom", getRoom);
router.put("/chats_detail/:idroom", passport.authenticate("jwt", { session: false }), keluarRoom);
router.post("/rejoinchats/:idroom", passport.authenticate("jwt", { session: false }), joinRoom);

// ROUTER USER ACTIVITY
router.put("/user/friend/:iduser", addListWaitingFriend);
router.get("/user/waitingfriend/:iduser", getListWaitingFriendV2);
router.put("/user/reject-friend/:iduser", rejectWaitingFriend);
router.put("/user/accept-friend/:iduser", acceptWaitingFriend);
router.get("/user/friend/:iduser", getFriendProfile);
router.put("/user/password", validatePassword, passport.authenticate("jwt", { session: false }), updatePassword);
router.put("/user/senduniquecode", validateEmailForUniqueCode, sendUniqueCode);
router.put("/user/validateuniquecode", validateUniqueCode, checkUniqueCode);
router.put("/user/resetpassword", validateResetPassword, resetPassword);
router.put("/user/profil", passport.authenticate("jwt", { session: false }), updateProfil);

// ROUTER PERSONAL CHAT
router.post("/chat/room/:iduser", passport.authenticate("jwt", { session: false }), checkRoomPersonalChat);
router.get("/chat/allv2/:iduser", passport.authenticate("jwt", { session: false }), getAllPersonalChatV2);

// ROUTER EVENT
router.get("/event/:type", getEvent);
router.post("/event/addevent", validateEvent, passport.authenticate("jwt", { session: false }), addEvent);

module.exports = router;
