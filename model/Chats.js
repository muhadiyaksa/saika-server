const mongoose = require("mongoose");
// require("../utils/db");

//Schema

const ChatsSaika = mongoose.model("ChatsSaika", {
  idroom: {
    type: String,
    required: true,
  },
  kategori: {
    type: String,
    required: true,
  },
  anggota: [
    {
      iduser: { type: String },
      fotoUser: { type: String },
      namauser: { type: String },
      usernameuser: { type: String },
    },
  ],
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
      image: {
        type: Boolean,
      },
      imageName: {
        type: String,
      },
      imageUrl: {
        type: String,
      },
      hightlight: {
        type: Boolean,
      },
      idHighlight: {
        type: String,
      },
      eventImage: {
        type: String,
      },
      eventName: {
        type: String,
      },
      institution: {
        type: String,
      },
      eventCategory: {
        type: String,
      },
      eventDate: {
        type: String,
      },
      paymentType: {
        type: String,
      },
      price: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    required: true,
  },
});

// const chats = new ChatsSaika({
//   idroom: "12037197491nuxhidh12873132",
//   kategori: "ya",
//   anggota: [
//     {
//       iduser: "123",
//       fotoUser: "wqe",
//       namauser: "ayas",
//       usernameuser: "ayas",
//     },
//   ],
// });

// chats.save().then((chats) => console.log(chats));
module.exports = ChatsSaika;
