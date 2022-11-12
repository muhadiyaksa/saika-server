const mongoose = require("mongoose");
// require("../utils/db");

const Event = mongoose.model("Event", {
  eventName: { type: String },
  eventImage: { type: String },
  eventCategory: { type: String },
  benefits: { type: String },
  description: { type: String },
  eventDate: { type: String },
  jamMulai: { type: String },
  jamSelesai: { type: String },
  paymentType: { type: String },
  price: { type: String },
  registrationLink: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  occurenceType: { type: String },
  mediaMeet: { type: String },
  location: { type: String },
  address: { type: String },
});

// const event = new Event({
//   eventName: "Hashmicro academy",
//   eventImage: "yaya",
//   eventCategory: "jarkom",
//   benefits: "snack, ilmu",
//   description: "hashmicro academy",
//   eventDate: "28 Agustus 2022",
//   jamMulai: "08.00",
//   jamSelesai: "11.00",
//   paymentType: "bayar",
//   price: "30000",
//   registrationLink: "bit.ly/wkwk",
//   instagram: "ya",
//   facebook: "ya",
//   twitter: "",
//   occurenceType: "online",
//   mediaMeet: "zoom",
//   location: "",
//   address: "",
// });

// event.save().then((chats) => console.log(chats));

module.exports = Event;
