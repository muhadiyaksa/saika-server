const UserTestSaika = require("../model/User");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

sgMail.setApiKey(process.env.API_KEY_SENDGRID);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
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
      password: hashedPasswordChecked,
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

const addListWaitingFriend = async (req, res) => {
  // console.log(req.params.iduser);
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });
  if (dataUser) {
    const userListWaitingSend = dataUser.listWaitingSend.map((el) => el.iduser);
    const dataUserReceive = await UserTestSaika.findOne({ _id: req.body.iduserreq });

    if (dataUserReceive) {
      let dataMasukUserReceive = {
        iduser: req.body.iduserreq,
        nama: dataUserReceive.nama,
        username: dataUserReceive.username,
        fotoUser: dataUserReceive.fotoUser.fotoUrl,
        status: "waiting",
      };
      let dataMasukUserSend = {
        iduser: req.params.iduser,
        nama: dataUser.nama,
        username: dataUser.username,
        fotoUser: dataUser.fotoUser.fotoUrl,
        status: "waiting",
      };
      if (userListWaitingSend.includes(req.body.iduserreq)) {
        res.send(dataUser);
      } else {
        //buat yang diajakin
        UserTestSaika.updateOne(
          {
            _id: req.body.iduserreq,
          },
          {
            $set: {
              listWaitingReceive: [dataMasukUserSend, ...dataUserReceive.listWaitingReceive],
            },
          }
        ).then(() => {
          //buat yang neken tombol tambah temen duluan
          UserTestSaika.updateOne(
            {
              _id: req.params.iduser,
            },
            {
              $set: {
                listWaitingSend: [dataMasukUserReceive, ...dataUser.listWaitingSend],
              },
            }
          ).then(() => {
            res.send({ iduserpengirim: req.params.iduser, iduserpenerima: req.body.iduserreq, status: "success" });
          });
        });
      }
    }
  }
};

const rejectWaitingFriend = async (req, res) => {
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });

  //req.param = yang nolak
  //req.body = yang ditolak
  if (dataUser) {
    const dataFilter = dataUser.listWaitingReceive.filter((el) => el.iduser !== req.body.iduserreq);
    const dataUserReject = await UserTestSaika.findOne({ _id: req.body.iduserreq });

    if (dataUserReject) {
      const dataFilterWaitingSend = dataUserReject.listWaitingSend.filter((el) => el.iduser !== req.params.iduser);

      UserTestSaika.updateOne(
        {
          _id: req.params.iduser,
        },
        {
          $set: {
            listWaitingReceive: [...dataFilter],
          },
        }
      ).then(() => {
        UserTestSaika.updateOne(
          {
            _id: req.body.iduserreq,
          },
          {
            $set: {
              listWaitingSend: [...dataFilterWaitingSend],
            },
          }
        ).then(() => {
          res.send({ iduserpenolak: req.params.iduser, iduserditolak: req.body.iduserreq, status: "success" });
        });
      });
    }
  }
};

const acceptWaitingFriend = async (req, res) => {
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });
  if (dataUser) {
    const dataFilter = dataUser.listWaitingReceive.filter((el) => el.iduser === req.body.iduserreq);
    const dataFilterWithOut = dataUser.listWaitingReceive.filter((el) => el.iduser !== req.body.iduserreq);
    const dataUserAccept = await UserTestSaika.findOne({ _id: req.body.iduserreq });

    if (dataUserAccept) {
      const dataFilterFriendSend = dataUserAccept.listWaitingSend.filter((el) => el.iduser === req.params.iduser);
      const dataFilterFriendSendWithOut = dataUserAccept.listWaitingSend.filter((el) => el.iduser !== req.params.iduser);
      UserTestSaika.updateOne(
        {
          _id: req.params.iduser,
        },
        {
          $set: {
            listWaitingReceive: [...dataFilterWithOut],
            listFriends: [...dataUser.listFriends, ...dataFilter],
          },
        }
      ).then(() => {
        UserTestSaika.updateOne(
          {
            _id: req.body.iduserreq,
          },
          {
            $set: {
              listWaitingSend: [...dataFilterFriendSendWithOut],
              listFriends: [...dataUserAccept.listFriends, ...dataFilterFriendSend],
            },
          }
        ).then(() => {
          res.send({ iduserpenerima: req.params.iduser, iduserditerima: req.body.iduserreq, status: "success" });
        });
      });
    }
  }
};

const getFriendProfile = async (req, res) => {
  const dataTeman = await UserTestSaika.findOne({ _id: req.params.iduser });
  if (dataTeman) {
    let dataMasuk = {
      iduser: req.params.iduser,
      jumlahTeman: dataTeman.listFriends.length,
      nama: dataTeman.nama,
      email: dataTeman.email,
      username: dataTeman.username,
      fotoProfil: dataTeman.fotoUser.fotoUrl,
    };
    res.send(dataMasuk);
  }
};

const updateProfil = async (req, res) => {
  console.log(req.body);
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  try {
    const dataUser = await UserTestSaika.findOne({ _id: req.body.iduserreq });
    const file = req.body.uploadFile === "true" ? req.files.file : "";
    const result = req.body.uploadFile === "true" ? await cloudinary.uploader.upload(file.tempFilePath, options) : "";
    console.log(dataUser);
    UserTestSaika.updateOne(
      {
        _id: req.body.iduserreq,
      },
      {
        $set: {
          nama: req.body.nama,
          username: req.body.username,
          fotoUser: {
            fotoNama: req.body.uploadFile === "true" ? `${result.public_id}.${result.format}` : dataUser?.fotoUser?.fotoNama,
            fotoUrl: req.body.uploadFile === "true" ? result.url : dataUser?.fotoUser?.fotoUrl,
          },
        },
      }
    )
      .then((result) => {
        res.send({ message: "success" });
      })
      .catch((err) => {
        console.log(err);
        res.send({ message: "failed", status: err.response.status });
      });
  } catch (err) {
    console.log(err);
    res.send({ message: "failed", status: err.response.status });
  }
};

const updatePassword = async (req, res) => {
  console.log(req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.send(errors);
  } else {
    const hashedPasswordChecked = await bcrypt.hash(req.body.passwordConfirm, 10);
    UserTestSaika.updateOne(
      {
        _id: req.body.iduserreq,
      },
      {
        $set: {
          password: hashedPasswordChecked,
          konfirmPassword: hashedPasswordChecked,
        },
      }
    )
      .then(() => {
        res.send({ message: "success" });
      })
      .catch((err) => {
        res.send({ message: "failed", status: err.response.status });
      });
  }
};

const sendUniqueCode = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.send(errors);
  } else {
    let transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: "getsaika@outlook.com", // generated ethereal user
        pass: "saika@280800", // generated ethereal password
      },
    });

    const filePath = path.join(__dirname, "../utils/templateEmail.html");
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);

    let huruf = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let codeRandom = [];
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        let random = Math.floor(Math.random() * 25) + 1;
        codeRandom.push(huruf[random]);
      } else {
        let random = Math.floor(Math.random() * 9) + 1;
        codeRandom.push(random);
      }
    }
    const replacements = {
      uniqueCode: codeRandom.join(""),
    };
    const htmlToSend = template(replacements);

    let details = {
      from: '"Sahabat Informatika" <getsaika@outlook.com>', // sender address
      to: req.body.email, // list of receivers
      subject: "Kode Unik Reset Password Akun SAIKA", // Subject line
      html: htmlToSend, // html body
    };

    transporter.sendMail(details, (err) => {
      if (err) {
        res.send({ status: err.response.status, message: "Kode Unik gagal Dikirim", err });
      } else {
        UserTestSaika.updateOne(
          {
            email: req.body.email,
          },
          {
            $set: {
              kodeunik: codeRandom.join(""),
            },
          }
        )
          .then(() => {
            res.send({ status: "success" });

            setTimeout(() => {
              UserTestSaika.updateOne(
                {
                  email: req.body.email,
                },
                {
                  $set: {
                    kodeunik: null,
                  },
                }
              ).then(() => {
                console.log("Kode unik telah di reset");
              });
            }, 300000);
          })
          .catch((err) => {
            res.send({ message: "failed", status: err.response.status });
          });
      }
    });
  }
};

const checkUniqueCode = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.send(errors);
  } else {
    res.send({ message: "success" });
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.send(errors);
  } else {
    const hashedPasswordChecked = await bcrypt.hash(req.body.passwordConfirm, 10);
    UserTestSaika.updateOne(
      {
        email: req.body.email,
      },
      {
        $set: {
          password: hashedPasswordChecked,
          konfirmPassword: hashedPasswordChecked,
        },
      }
    )
      .then(() => {
        res.send({ message: "success" });
      })
      .catch((err) => {
        res.send({ message: "failed", status: err.response.status });
      });
  }
};

module.exports = { Register, addListWaitingFriend, rejectWaitingFriend, acceptWaitingFriend, getFriendProfile, updateProfil, updatePassword, sendUniqueCode, checkUniqueCode, resetPassword };
