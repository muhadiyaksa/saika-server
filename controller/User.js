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
  UserTestSaika.updateOne(
    {
      _id: req.body.iduserreq,
    },
    {
      $set: {
        nama: req.body.nama,
        username: req.body.username,
      },
    }
  )
    .then((result) => {
      res.send({ message: "success" });
    })
    .catch((err) => {
      res.send({ message: "failed", status: err.response.status });
    });
};

const updatePassword = async (req, res) => {
  const hashedPasswordChecked = await bcrypt.hash(req.body.passwordConfirm, 10);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.send(errors);
  } else {
    UserTestSaika.updateOne(
      {
        _id: req.body.iduserreq,
      },
      {
        $set: {
          password: req.body.passwordNew,
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

module.exports = { Register, addListWaitingFriend, rejectWaitingFriend, acceptWaitingFriend, getFriendProfile, updateProfil, updatePassword };
