const UserTestSaika = require("../model/User");
const ChatsSaika = require("../model/Chats");
const passport = require("passport");
const crypto = require("crypto");

const buatRoom = async (req, res) => {
  const cekRoom = await ChatsSaika.findOne({ kategori: req.body.kategori });
  if (cekRoom) {
    let dataAnggota = cekRoom.anggota.filter((el) => el.iduser !== req.body.iduser);
    const dataUser = {
      iduser: req.body.iduser,
      fotoUser: req.body.fotoUser,
      namauser: req.body.namauser,
      usernameuser: req.body.usernameuser,
    };
    ChatsSaika.updateOne(
      { kategori: req.body.kategori },
      {
        $set: {
          anggota: [...dataAnggota, dataUser],
        },
      }
    ).then(() => {
      res.send(cekRoom.idroom);
    });
  } else {
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
      res.send(dataMasuk.idroom);
    });
  }
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

const hapusRoom = () => {};

module.exports = { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom };
