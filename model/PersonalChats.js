const mongoose = require("mongoose");
const PersonalChatSaika = mongoose.model("PersonalChatSaika", {
  iduserpertama: { type: String },
  iduserkedua: { type: String },
  iduserLastSender: { type: String },
  statusChatUserPertama: { type: String },
  statusChatUserKedua: { type: String },
  statusNotifUserPertama: { type: String },
  statusNotifUserKedua: { type: String },
  chats: [
    {
      iduser: { type: String },
      usernameuser: { type: String },
      namauser: { type: String },
      kondisi: { type: String },
      waktu: {
        type: String,
      },
      tanggal: {
        type: String,
      },
      pesan: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});
module.exports = PersonalChatSaika;
