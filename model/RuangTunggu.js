const mongoose = require("mongoose");
// require("../utils/db");

//Schema

const RuangTunggu = mongoose.model("RuangTunggu", {
  nomorantrian: {
    type: String,
  },
  kategori: {
    type: String,
    required: true,
  },
  iduser: {
    type: String,
    required: true,
  },
});

// const chats = new RuangTunggu({
//   nomorantrian: "123123",
//   kategori: "mm",
//   iduser: "11123111",
// });

// chats.save().then((chats) => console.log(chats));
module.exports = RuangTunggu;
