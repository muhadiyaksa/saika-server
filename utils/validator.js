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

const validateEvent = [
  body("iduser").custom(async (value) => {
    const dataUser = await UserTestSaika.findOne({ _id: value });
    if (!dataUser._id) {
      throw new Error("Akun belum terdaftar sebagai Pengguna SAIKA");
    }
    return true;
  }),
  body("eventName").custom(async (value, { req }) => {
    let dataCek = [value, req.body.eventImage, req.body.eventCategory, req.body.benefits, req.body.description];

    if (dataCek.includes("") || dataCek.includes(null) || dataCek.includes(undefined)) {
      throw new Error("General Info ada yang belum Diisi");
    }
    console.log(dataCek);
    return true;
  }),
  body("eventDate")
    .not()
    .isEmpty()
    .custom(() => {
      throw new Error("Event Date harus diisi");
    }),
  body("jamMulai")
    .not()
    .isEmpty()
    .custom(() => {
      throw new Error("Jam Mulai harus diisi");
    }),
  body("jamSelesai")
    .not()
    .isEmpty()
    .custom(() => {
      throw new Error("Jam Selesai harus diisi");
    }),
  body("eventDate").custom(async (value, { req }) => {
    let tahun = new Date().getFullYear(),
      bulan = new Date().getMonth() + 1,
      tanggal = new Date().getDate();

    let dataNow = new Date(`${tahun}-${bulan}-${tanggal}`).getTime() + 604800000;
    let dataSend = new Date(value).getTime();
    console.log(`${tahun}-${bulan}-${tanggal}`);
    console.log(value);
    if (dataSend >= dataNow) {
      return true;
    } else {
      throw new Error("Tanggal kegiatan minimal 7 hari setelah hari ini");
    }
  }),
  body("jamSelesai").custom(async (value, { req }) => {
    let jamMulai;
  }),
];
module.exports = { validateRegist, validatePassword, validateEvent };
