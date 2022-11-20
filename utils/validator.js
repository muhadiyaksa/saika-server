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
  body("email").custom(async (value) => {
    const dataUser = await UserTestSaika.findOne({ email: value });

    if (!dataUser) {
      throw new Error("Akun belum terdaftar sebagai Pengguna SAIKA");
    } else {
      return true;
    }
  }),
  body("eventName").not().isEmpty().withMessage("Event Date Harus Diisi!"),
  body("eventImage").not().isEmpty().withMessage("Jam Mulai Harus Diisi!"),
  body("eventCategory").not().isEmpty().withMessage("Jam Mulai Harus Diisi!"),
  body("benefits").not().isEmpty().withMessage("Jam Mulai Harus Diisi!"),
  body("description").not().isEmpty().withMessage("Jam Mulai Harus Diisi!"),
  body("eventDate").not().isEmpty().withMessage("Event Date Harus Diisi!"),
  body("eventTimeStart").not().isEmpty().withMessage("Jam Mulai Harus Diisi!"),
  body("eventTimeFinish").not().isEmpty().withMessage("Jam Selesai Harus Diisi!"),
  body("eventDate").custom(async (value, { req }) => {
    let tahun = new Date().getFullYear(),
      bulan = new Date().getMonth() + 1,
      tanggal = new Date().getDate();

    let dataNow = new Date(`${tahun}-${bulan}-${tanggal}`).getTime() + 604800000;
    let dataSend = new Date(value).getTime();
    if (!dataSend) {
      throw new Error("Format tanggal tidak sesuai!");
    } else {
      if (dataSend >= dataNow) {
        return true;
      } else {
        throw new Error("Tanggal kegiatan minimal 7 hari setelah hari ini");
      }
    }
  }),
  body("paymentType").custom((value, { req }) => {
    if (value === "bayar") {
      if (req.body.price === "" || !req.body.price) {
        throw new Error("Biaya pendaftaran tidak boleh kosong");
      } else {
        return true;
      }
    } else {
      return true;
    }
  }),
  body("registrationLink").not().isEmpty().withMessage("Link Registrasi Harus Diisi!"),
  body("occurenceType").custom(async (value, { req }) => {
    if (value === "online") {
      if (req.body.mediaMeet === "" || !req.body.mediaMeet) {
        throw new Error("Media Acara secara online tidak boleh kosong");
      } else {
        return true;
      }
    } else if (value === "offline") {
      if (req.body.location === "" || !req.body.location) {
        throw new Error("Lokasi Acara secara offline tidak boleh kosong");
      }
      if (req.body.address === "" || !req.body.address) {
        throw new Error("Alamat Acara secara offline tidak boleh kosong");
      }
      return true;
    }
  }),
];
module.exports = { validateRegist, validatePassword, validateEvent };
