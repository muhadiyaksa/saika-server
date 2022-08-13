const mongoose = require("mongoose");

const UserFriends = mongoose.model("UserFriend", {
  iduser: { type: String },
  listFriends: [
    {
      iduser: { type: String },
      nama: { type: String },
      username: { type: String },
      fotoUser: { type: String },
      status: { type: String },
    },
  ],
  listWaitingFriends: [
    {
      iduser: { type: String },
      nama: { type: String },
      username: { type: String },
      fotoUser: { type: String },
      status: { type: String },
    },
  ],
});

module.exports = UserFriends;
