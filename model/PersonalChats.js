const mongoose = require("mongoose");
const PersonalChatSaika = mongoose.model("PersonalChatSaika", {
  iduserpertama: { type: String },
  iduserkedua: { type: String },
  userpertama: {
    nama: { type: String },
    username: { type: String },
    fotoProfi: { type: String },
  },
  userkedua: {
    nama: { type: String },
    username: { type: String },
    fotoProfi: { type: String },
  },
  status: { type: String },
  statusNotif: { type: String },
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
});
module.exports = PersonalChatSaika;
