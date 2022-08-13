const UserTestSaika = require("../model/User");
const ChatsSaika = require("../model/Chats");
const crypto = require("crypto");

const buatRoom = async (req, res) => {
  const cekRuangDiskusi = await ChatsSaika.find({ kategori: req.body.kategori });
  if (cekRuangDiskusi.length === 0) {
    const dataMasuk = {
      idroom: crypto.randomBytes(64).toString("hex"),
      kategori: req.body.kategori,
      anggota: [
        {
          iduser: req.body.iduser,
          fotoUser: req.body.fotoUser,
          namauser: req.body.namauser,
          usernameuser: req.body.usernameuser,
        },
      ],
    };
    ChatsSaika.insertMany(dataMasuk, (error, result) => {
      res.send({ status: "waiting" });
    });
  } else {
    const cekAnggotaRuangDiskusi = await ChatsSaika.findOne({ kategori: req.body.kategori });
    //udah ada nih ruang chat , anggotanya 1
    if (cekAnggotaRuangDiskusi) {
      let dataAnggota = cekAnggotaRuangDiskusi.anggota.map((el) => el.iduser);
      if (dataAnggota.includes(req.body.iduser)) {
        if (dataAnggota.length > 1 && req.body.percobaan <= 20) {
          res.send({ status: "finish", idroom: cekAnggotaRuangDiskusi.idroom });
        } else if (dataAnggota.length === 1 && req.body.percobaan <= 20) {
          res.send({ status: "waiting" });
        } else {
          ChatsSaika.deleteMany({ idroom: cekAnggotaRuangDiskusi.idroom }).then(() => {
            res.send({ status: "rejected" });
          });
        }
      } else {
        if (req.body.percobaan === 0) {
          res.send({ status: "waiting" });
        } else {
          const dataUser = {
            iduser: req.body.iduser,
            fotoUser: req.body.fotoUser,
            namauser: req.body.namauser,
            usernameuser: req.body.usernameuser,
          };
          console.log(dataUser);
          ChatsSaika.updateOne(
            { idroom: cekAnggotaRuangDiskusi.idroom },
            {
              $set: {
                anggota: [...cekAnggotaRuangDiskusi.anggota, dataUser],
              },
            }
          ).then(() => {
            res.send({ status: "finish", idroom: cekAnggotaRuangDiskusi.idroom });
          });
        }
      }
    }
  }

  // if (cekRuangTunggu.length === 0) {
  //   let dataMasuk = {
  //     nomorantrian: req.body.nomerantrian,
  //     kategori: req.body.kategori,
  //     iduser: req.body.iduser,
  //   };
  //   RuangTunggu.create({ ...dataMasuk }).then(() => {
  //     res.send({ status: "waiting" });
  //   });
  // } else {
  //   const cekRuangTungguAll = await RuangTunggu.find({ kategori: req.body.kategori });

  //   if (cekRuangTungguAll.length > 1 && req.body.percobaan <= 20) {
  //     const cekRoom = await ChatsSaika.findOne({ kategori: req.body.kategori });
  //     if (cekRoom) {
  //       let dataAnggota = cekRoom.anggota.filter((el) => el.iduser !== req.body.iduser);
  //       const dataUser = {
  //         iduser: req.body.iduser,
  //         fotoUser: req.body.fotoUser,
  //         namauser: req.body.namauser,
  //         usernameuser: req.body.usernameuser,
  //       };
  //       ChatsSaika.updateOne(
  //         { kategori: req.body.kategori },
  //         {
  //           $set: {
  //             anggota: [...dataAnggota, dataUser],
  //           },
  //         }
  //       ).then(() => {
  //         res.send({ status: "finish", idroom: cekRoom.idroom });
  //       });
  //     } else {

  //       const dataMasuk = {
  //         idroom: crypto.randomBytes(64).toString("hex"),
  //         kategori: req.body.kategori,
  //         anggota: [
  //           {
  //             iduser: req.body.iduser,
  //             fotoUser: req.body.fotoUser,
  //             namauser: req.body.namauser,
  //             usernameuser: req.body.usernameuser,
  //           },
  //         ],
  //       };
  //       ChatsSaika.insertMany(dataMasuk, (error, result) => {
  //         res.send({ status: "finish", idroom: dataMasuk.idroom });
  //       });
  //     }
  //   } else if (cekRuangTungguAll.length === 1 && req.body.percobaan <= 20) {
  //     res.send({ status: "waiting" });
  //   } else {
  //     RuangTunggu.deleteMany({ iduser: req.body.iduser, kategori: req.body.kategori }).then(() => {
  //       res.send({ status: "rejected" });
  //     });
  //   }
  // }
};

const getRoom = async (req, res) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: req.params.idroom });
  if (cekRoom) {
    res.send(cekRoom);
  }
};

const addPesan = () => {};

const keluarRoom = async (req, res) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: req.params.idroom });
  if (cekRoom) {
    let sisaAnggota = cekRoom.anggota.filter((el) => el.iduser !== req.body.iduser);
    // let sisaAnggota =
    ChatsSaika.updateOne(
      { idroom: req.params.idroom },
      {
        $set: {
          anggota: [...sisaAnggota],
        },
      }
    ).then(async () => {
      const cekAnggotaRoom = await ChatsSaika.findOne({ idroom: req.params.idroom });
      if (cekAnggotaRoom.anggota.length === 0) {
        ChatsSaika.deleteOne({ idroom: req.params.idroom });
      }
    });
  }
};

const hapusRoom = (req, res) => {
  ChatsSaika.deleteOne({ idroom: req.params.idroom }).then((result) => {
    res.send(result);
  });
};

module.exports = { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom };
