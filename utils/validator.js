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
  // body("iduserreq").not().isEmpty().withMessage("Form Wajib Diisi"),
  body("iduserreq").custom(async (value, { req }) => {
    console.log(value);
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
  body("eventImage").not().isEmpty().withMessage("Event Harus memiliki Poster"),
  body("eventCategory").not().isEmpty().withMessage("Kategory wajib dipilih"),
  body("benefits").not().isEmpty().withMessage("Benefits wajib diisi"),
  body("descriptions").not().isEmpty().withMessage("Deskripsi Acara wajib diisi"),
  body("eventDate").not().isEmpty().withMessage("Event Date Harus Diisi!"),
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

const validateEmailForUniqueCode = [
  body("email").custom(async (value) => {
    const dataUser = await UserTestSaika.findOne({ email: value });

    if (!dataUser) {
      throw new Error("Email tidak terdaftar sebagai Pengguna SAIKA");
    } else {
      return true;
    }
  }),
  check("email", "Email tidak Valid!").isEmail(),
];

const validateUniqueCode = [
  body("email").custom(async (value, { req }) => {
    const dataUser = await UserTestSaika.findOne({ email: value });

    if (!dataUser) {
      throw new Error("Email tidak terdaftar sebagai Pengguna SAIKA");
    } else {
      if (dataUser.kodeunik !== req.body.kodeunik) {
        throw new Error("Kode Unik tidak Valid!");
      } else {
        return true;
      }
    }
  }),
];

const validateResetPassword = [
  body("email").custom(async (value) => {
    const dataUser = await UserTestSaika.findOne({ email: value });

    if (!dataUser) {
      throw new Error("Email tidak terdaftar sebagai Pengguna SAIKA");
    } else {
      return true;
    }
  }),
  body("kodeunik").custom(async (value, { req }) => {
    const dataUser = await UserTestSaika.findOne({ email: req.body.email });

    if (dataUser.kodeunik === value) {
      return true;
    } else {
      throw new Error("Kode Unik Tidak Valid");
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

module.exports = { validateRegist, validatePassword, validateEvent, validateEmailForUniqueCode, validateUniqueCode, validateResetPassword };
