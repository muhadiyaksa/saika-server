const { check, body } = require("express-validator");
const UserTestSaika = require("../model/User");

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
module.exports = { validateRegist };
