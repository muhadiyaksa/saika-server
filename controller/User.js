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

module.exports = { Register, addListWaitingFriend };
