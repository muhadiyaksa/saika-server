const Event = require("../model/Event");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const addEvent = async (req, res) => {
  const errors = validationResult(req);
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  if (!errors.isEmpty()) {
    res.send(errors);
  } else {
    try {
      // Upload the image
      const file = req.files.file;
      const result = await cloudinary.uploader.upload(file.tempFilePath, options);

      let dataMasuk = {
        eventName: req.body.eventName,
        eventImage: result.url,
        eventCategory: req.body.eventCategory,
        benefits: req.body.benefits,
        description: req.body.descriptions,
        eventDate: req.body.eventDate,
        eventTimeStart: req.body.eventTimeStart,
        eventTimeFinish: req.body.eventTimeFinish,
        paymentType: req.body.paymentType,
        price: req.body.price,
        registrationLink: req.body.registrationLink,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        occurenceType: req.body.occurenceType,
        mediaMeet: req.body.mediaMeet,
        location: req.body.location,
        address: req.body.address,
      };

      Event.insertMany(dataMasuk, (error, result) => {
        if (error) {
          console.log("kesini");
          res.sendStatus(500).send({ status: "failed" });
        } else {
          res.send({
            status: "finish",
            data: {
              eventName: req.body.eventName,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};

module.exports = { addEvent };
