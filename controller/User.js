const UserTestSaika = require("../model/User");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const Register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.send(errors);
  } else {
    const hashedPasswordChecked = await bcrypt.hash(req.body.konfirmPassword, 10);
    const dataMasuk = {
      nama: req.body.nama.toLowerCase(),
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      konfirmPassword: hashedPasswordChecked,
      fotoUser: {
        fotoNama: "",
        fotoUrl: "",
      },
    };
    UserTestSaika.insertMany(dataMasuk, (error, result) => {
      res.send("success");
    });
  }
};

module.exports = { Register };
