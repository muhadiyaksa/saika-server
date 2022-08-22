const PersonalChatSaika = require("../model/PersonalChats");
const UserTestSaika = require("../model/User");

const checkRoomPersonalChat = async (req, res) => {
  const checkRoomPengirim = await PersonalChatSaika.findOne({ idpengirim: req.params.iduser, idpenerima: req.body.iduserreceive });
  const checkRoomPenerima = await PersonalChatSaika.findOne({ idpengirim: req.body.iduserreceive, idpenerima: req.params.iduser });

  if (checkRoomPengirim || checkRoomPenerima) {
    let dataRoom = { ...checkRoomPengirim, ...checkRoomPenerima };
    res.send(dataRoom);
  } else {
    const userSender = await UserTestSaika.findOne({ _id: req.params.iduser });
    const userReceiver = await UserTestSaika.findOne({ _id: req.body.iduserreceive });

    if (userSender && userReceiver) {
      let dataMasuk = {
        iduserpertama: req.params.iduser,
        iduserkedua: req.body.iduserreceive,
        status: "null",
        userpertama: {
          nama: userSender.nama,
          username: userSender.username,
          fotoProfil: userSender.fotoUser.fotoUrl,
        },
        userkedua: {
          nama: userReceiver.nama,
          username: userReceiver.username,
          fotoProfil: userReceiver.fotoUser.fotoUrl,
        },
        chats: [],
      };
      PersonalChatSaika.create({ ...dataMasuk }).then(async () => {
        const checkRoomPengirim = await PersonalChatSaika.findOne({ idpengirim: req.params.iduser, idpenerima: req.body.iduserreceive });
        const checkRoomPenerima = await PersonalChatSaika.findOne({ idpengirim: req.body.iduserreceive, idpenerima: req.params.iduser });
        let dataRoom = { ...checkRoomPengirim, ...checkRoomPenerima };
        res.send(dataRoom);
      });
    }
  }
};

const getPersonalChat = async (req, res) => {
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });
  const dataChat = await PersonalChatSaika.find({ iduserpertama: req.params.iduser });
  const dataChat2 = await PersonalChatSaika.find({ iduserkedua: req.params.iduser });
  if (dataUser) {
    let gabunganDataChat = [...dataChat, ...dataChat2];
    let dataFriend = dataUser.listFriends.map((el) => el.iduser);
    let hasil = gabunganDataChat.map((el) => {
      if (el.iduserpertama === req.params.iduser) {
        if (dataFriend.includes(el.iduserkedua)) {
          let dataMasuk = {
            idfriend: el.iduserkedua,
            status: el.chats[0].iduser !== req.params.iduser ? "active" : "null",
          };

          return dataMasuk;
        }
      } else {
        if (dataFriend.includes(el.iduserpertama)) {
          let dataMasuk = {
            idfriend: el.iduserpertama,
            status: el.chats[0].iduser !== req.params.iduser ? "active" : "null",
          };
          return dataMasuk;
        }
      }
    });
    console.log(hasil);
    res.send(hasil);
  }
};

const getAllPersonalChat = async (req, res) => {
  const personalChat1 = await PersonalChatSaika.find({ iduserpertama: req.params.iduser });
  const personalChat2 = await PersonalChatSaika.find({ iduserkedua: req.params.iduser });
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });

  let dataGabung = [...personalChat1, ...personalChat2];
  if (dataUser) {
    let dataFriend = dataUser.listFriends.map((el) => el.iduser);

    let hasil = dataGabung.map((el) => {
      if (el.iduserpertama === req.params.iduser) {
        if (dataFriend.includes(el.iduserkedua)) {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserkedua,
            status: el.status,
            chat: el.chats[0].iduser,
          };
          return dataArray;
        }
      } else {
        if (dataFriend.includes(el.iduserpertama)) {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserpertama,
            status: el.status,
            chat: el.chats[0].iduser,
          };
          return dataArray;
        }
      }
    });
    console.log(hasil);
    res.send(hasil);
  }
};

const updateStatusPersonalChat = async (req, res) => {
  const personalChat = await PersonalChatSaika.findOne({ _id: req.params.idchat });
  if (personalChat) {
    PersonalChatSaika.updateOne(
      {
        _id: req.params.idchat,
      },
      {
        $set: {
          status: "null",
        },
      }
    ).then(() => {
      res.send({ status: "success" });
    });
  }
};

module.exports = { checkRoomPersonalChat, getPersonalChat, getAllPersonalChat, updateStatusPersonalChat };
