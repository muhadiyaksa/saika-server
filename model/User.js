const mongoose = require("mongoose");
// require("../utils/db");

//Schema

const UserTestSaika = mongoose.model("UserTestSaika", {
  nama: {
    type: String,
    // required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  jenisKelamin: {
    type: String,
  },
  fotoUser: {
    fotoNama: { type: String },
    fotoUrl: { type: String },
  },
  password: { type: String, required: true },
  konfirmPassword: { type: String },
  kodeunik: { type: String },
  refresh_token: {
    type: String,
  },
  listFriends: [
    {
      iduser: { type: String },
      nama: { type: String },
      username: { type: String },
      fotoUser: { type: String },
      status: { type: String },
      urutan: { type: Number },
    },
  ],
  listWaitingSend: [
    {
      iduser: { type: String },
      nama: { type: String },
      username: { type: String },
      fotoUser: { type: String },
      status: { type: String },
    },
  ],
  listWaitingReceive: [
    {
      iduser: { type: String },
      nama: { type: String },
      username: { type: String },
      fotoUser: { type: String },
      status: { type: String },
    },
  ],
});

// const user1 = new UserTestSaika({
//   nama: "Muhamad Adi Yaksa",
//   username: "muhadiyaksa",
//   email: "muhadiyaksa@gmail.com",
//   password: "ayas280800",
// });

// user1.save().then((user) => console.log(user));

module.exports = UserTestSaika;
