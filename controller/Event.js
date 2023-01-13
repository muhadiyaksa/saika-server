const Event = require("../model/Event");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

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
      let idEvent = crypto.randomBytes(64).toString("hex");
      let dataMasuk = {
        eventName: req.body.eventName,
        eventId: idEvent,
        eventImage: result.url,
        eventCategory: req.body.eventCategory,
        institution: req.body.institution,
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
              id: idEvent,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const getEvent = async (req, res) => {
  if (req.params.type === "all") {
    const event = await Event.find();
    if (event.length !== 0) {
      res.send({
        totalData: event.length,
        events: event,
      });
    } else {
      res.status(404).send({
        status: "failed",
        message: "Data Tidak Ditemukan",
      });
    }
  } else if (req.params.type === "single") {
    try {
      const event = await Event.findOne({ eventId: req.query.id });
      if (event) {
        res.send(event);
      } else {
        res.status(404).send({
          status: "failed",
          message: "Data Tidak Ditemukan",
        });
      }
    } catch (err) {
      res.status(err.response.status).send({
        status: "failed",
        message: "Data gagal diambil.",
      });
    }
  } else if (req.params.type === "pagination") {
    //pagination?qty=2&current=1
    const event = await Event.find();
    let eventData = [...event];
    let pagination = +req.query.qty;
    let forLop = Math.ceil(event.length / pagination);
    let arrayNew = [];

    for (let i = 0; i < forLop; i++) {
      let data = {
        current: i + 1,
        pagination,
        totalPagination: forLop,
        events: eventData.slice(0, pagination),
      };
      arrayNew.push(data);
      eventData.splice(0, pagination);
    }

    let sendData = arrayNew.find((el) => el.current === +req.query.current);
    if (sendData) {
      res.send(sendData);
    } else {
      res.status(404).send({
        status: "failed",
        message: "Data Tidak Ditemukan",
      });
    }
  } else if (req.params.type === "search") {
    const [events, eventsIns] = await Promise.all([Event.find({ eventName: new RegExp(req.query.key, "i") }), Event.find({ institution: new RegExp(req.query.key, "i") })]);

    let mix = [...events, ...eventsIns];
    let unDuplicate = [...new Map(mix.map((m) => [m.eventId, m])).values()];

    if (unDuplicate.length !== 0) {
      res.send({
        key: req.query.key,
        totalData: unDuplicate.length,
        events: unDuplicate,
      });
    } else {
      res.status(404).send({
        status: "failed",
        message: "Data Tidak Ditemukan",
      });
    }
  } else if (req.params.type === "filter") {
    let data = [];
    if (req.query.key !== "DEFAULT") {
      const [events, eventsIns] = await Promise.all([Event.find({ eventName: new RegExp(req.query.key, "i") }), Event.find({ institution: new RegExp(req.query.key, "i") })]);

      let mix = [...events, ...eventsIns];
      let unDuplicate = [...new Map(mix.map((m) => [m.eventId, m])).values()];

      if (req.query.category === "DEFAULT" && req.query.paymentType === "DEFAULT") {
        data = [...unDuplicate];
      } else if (req.query.category !== "DEFAULT" && req.query.paymentType === "DEFAULT") {
        let findCategory = unDuplicate.filter((el) => el.eventCategory === req.query.category);
        data = [...findCategory];
      } else if (req.query.category === "DEFAULT" && req.query.paymentType !== "DEFAULT") {
        let findCategory = unDuplicate.filter((el) => el.paymentType === req.query.paymentType);
        data = [...findCategory];
      } else {
        let findCategory = unDuplicate.filter((el) => el.eventCategory === req.query.category && el.paymentType === req.query.paymentType);
        data = [...findCategory];
      }
    } else {
      if (req.query.category === "DEFAULT" && req.query.paymentType === "DEFAULT") {
        const eventsAll = await Event.find();
        data = [...eventsAll];
      } else if (req.query.category !== "DEFAULT" && req.query.paymentType === "DEFAULT") {
        const eventsCatg = await Event.find({ eventCategory: req.query.category });
        data = [...eventsCatg];
      } else if (req.query.category === "DEFAULT" && req.query.paymentType !== "DEFAULT") {
        const eventsPaymT = await Event.find({ paymentType: req.query.paymentType });
        data = [...eventsPaymT];
      } else {
        const eventsPayCatg = await Event.find({ eventCategory: req.query.category, paymentType: req.query.paymentType });
        data = [...eventsPayCatg];
      }
    }

    let waiting = new Promise((fulfil, reject) => {
      if (data.length !== 0) {
        let pagination = +req.query.qty;
        let forLop = Math.ceil(data.length / pagination);
        let arrayNew = [];

        for (let i = 0; i < forLop; i++) {
          let array = {
            current: i + 1,
            pagination,
            totalPagination: forLop,
            events: data.slice(0, pagination),
            totalData: data.length,
          };
          arrayNew.push(array);
          data.splice(0, pagination);
        }

        let sendData = arrayNew.find((el) => el.current === +req.query.current);
        return fulfil(sendData);
      } else {
        reject(data);
      }
    });

    waiting
      .then((result) => {
        if (result) {
          res.send(result);
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(404).send({
          status: "failed",
          message: "Data tidak ditemukan",
        });
      });
  } else {
    res.status(404).send({
      status: "failed",
      message: "Parameter Bermasalah",
    });
  }
};

module.exports = { addEvent, getEvent };
