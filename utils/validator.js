const { check, body } = require("express-validator");
const UserTestSaika = require("../model/User");
const bcrypt = require("bcrypt");

const validateRegist = [
  body("email").custom(async (value) => {
    const duplikat = await UserTestSaika.findOne({ email: value });
    if (duplikat) {
      throw new Error("Email Sudah Pernah DiDaftarkan!");
    }
    return true;
  }),
  check("email", "Email tidak Valid!").isEmail(),
  check("password").isLength({ min: 8 }).withMessage("Password Minimal Karakter adalah 8").matches(/\d/).withMessage("Password Harus Berisi Nomor"),
  body("konfirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Konfirmasi Password tidak sama dengan Password Utama");
    }
    return true;
  }),
];

const validatePassword = [
  body("iduserreq").custom(async (value, { req }) => {
    const dataUser = await UserTestSaika.findOne({ _id: value });
    if (dataUser?.konfirmPassword) {
      const validate = await bcrypt.compare(req.body.passwordOld, dataUser.konfirmPassword);
      if (!validate) {
        throw new Error("Password lama tidak sesuai");
      }
      return true;
    }
  }),
  check("passwordNew").isLength({ min: 8 }).withMessage("Password Minimal Karakter adalah 8").matches(/\d/).withMessage("Password Harus Berisi Nomor"),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.passwordNew) {
      throw new Error("Konfirmasi Password tidak sama dengan Password Utama");
    }
    return true;
  }),
];
module.exports = { validateRegist, validatePassword };
