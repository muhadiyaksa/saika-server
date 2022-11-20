const Event = require("../model/Event");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  secure: true,
});

const addEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.send(errors);
  } else {
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    const file = req.files.image;
    console.log(file);
    // const result = await cloudinary.uploader.upload(file.tempFilePath, {
    //   public_id: `${Date.now()}`,
    //   resource_type: auto,
    //   folder: images,
    // });
    // res.json(result);
    // let dataMasuk = {
    //   eventName: req.body.eventName,
    //   eventImage: req.body.eventImage,
    //   eventCategory: req.body.eventCategory,
    //   benefits: req.body.benefits,
    //   description: req.body.descriptions,
    //   eventDate: req.body.eventDate,
    //   eventTimeStart: req.body.eventTimeStart,
    //   eventTimeFinish: req.body.eventTimeFinish,
    //   paymentType: req.body.paymentType,
    //   price: req.body.price,
    //   registrationLink: req.body.registrationLink,
    //   instagram: req.body.instagram,
    //   facebook: req.body.facebook,
    //   twitter: req.body.twitter,
    //   occurenceType: req.body.occurenceType,
    //   mediaMeet: req.body.mediaMeet,
    //   location: req.body.location,
    //   address: req.body.address,
    // };
    // Event.insertMany(dataMasuk, (error, result) => {
    //   if (error) {
    //     console.log("kesini");
    //     res.sendStatus(500).send({ status: "failed" });
    //   } else {
    //     res.send({ status: "finish", idroom: dataMasuk.idroom });
    //   }
    // });
  }
};

module.exports = { addEvent };
