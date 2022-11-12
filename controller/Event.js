const Event = require("../model/Event");
const { validationResult } = require("express-validator");

const addEvent = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.send(errors);
  } else {
    res.send(req.body);
  }
};

module.exports = { addEvent };
