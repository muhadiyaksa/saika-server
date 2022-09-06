const PersonalChatSaika = require("../model/PersonalChats");
const UserTestSaika = require("../model/User");
const { namesSetMonth, setIndeksHours } = require("../utils/numberFormat");

const checkRoomPersonalChat = async (req, res) => {
  const [checkRoomPengirim, checkRoomPenerima] = await Promise.all([
    PersonalChatSaika.findOne({ idpengirim: req.params.iduser, idpenerima: req.body.iduserreceive }),
    PersonalChatSaika.findOne({ idpengirim: req.body.iduserreceive, idpenerima: req.params.iduser }),
  ]);
  if (checkRoomPengirim || checkRoomPenerima) {
    let dataRoom = { ...checkRoomPengirim, ...checkRoomPenerima };
    res.send(dataRoom);
  } else {
    const [userSender, userReceiver] = await Promise.all([UserTestSaika.findOne({ _id: req.params.iduser }), UserTestSaika.findOne({ _id: req.body.iduserreceive })]);

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
        const [checkRoomPengirim, checkRoomPenerima] = await Promise.all([
          PersonalChatSaika.findOne({ idpengirim: req.params.iduser, idpenerima: req.body.iduserreceive }),
          PersonalChatSaika.findOne({ idpengirim: req.body.iduserreceive, idpenerima: req.params.iduser }),
        ]);
        if (checkRoomPengirim && checkRoomPenerima) {
          let dataRoom = { ...checkRoomPengirim, ...checkRoomPenerima };
          res.send(dataRoom);
        }
      });
    }
  }
};

const getPersonalChat = async (req, res) => {
  const [dataUser, dataChat, dataChat2] = await Promise.all([UserTestSaika.findOne({ _id: req.params.iduser }), PersonalChatSaika.find({ iduserpertama: req.params.iduser }), PersonalChatSaika.find({ iduserkedua: req.params.iduser })]);

  if (dataUser && dataChat && dataChat2) {
    let gabunganDataChat = [...dataChat, ...dataChat2];
    let dataFriend = dataUser.listFriends.map((el) => el.iduser);
    let hasil = gabunganDataChat.map((el) => {
      if (el.iduserpertama === req.params.iduser) {
        if (dataFriend.includes(el.iduserkedua)) {
          let dataMasuk = {
            idfriend: el.iduserkedua,
            status: el.chats[0].iduser !== req.params.iduser ? "active" : "null",
            statusNotif: el.chats[0].iduser !== req.params.iduser ? "active" : "null",
          };

          return dataMasuk;
        }
      } else {
        if (dataFriend.includes(el.iduserpertama)) {
          let dataMasuk = {
            idfriend: el.iduserpertama,
            status: el.chats[0].iduser !== req.params.iduser ? "active" : "null",
            statusNotif: el.chats[0].iduser !== req.params.iduser ? "active" : "null",
          };
          return dataMasuk;
        }
      }
    });
    res.send(hasil);
  }
};

const getAllPersonalChat = async (req, res) => {
  const [personalChat1, personalChat2, dataUser] = await Promise.all([
    PersonalChatSaika.find({ iduserpertama: req.params.iduser }),
    PersonalChatSaika.find({ iduserkedua: req.params.iduser }),
    UserTestSaika.findOne({ _id: req.params.iduser }),
  ]);

  if (dataUser && personalChat1 && personalChat2) {
    let dataGabung = [...personalChat1, ...personalChat2];
    let dataFriend = dataUser.listFriends.map((el) => el.iduser);

    let hasil = dataGabung.map((el) => {
      if (el.iduserpertama === req.params.iduser) {
        if (dataFriend.includes(el.iduserkedua)) {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserkedua,
            status: el.status,
            statusNotif: el.statusNotif,
            chat: el.chats[0].iduser,
            username: el.chats[0].usernameuser,
          };
          return dataArray;
        }
      } else {
        if (dataFriend.includes(el.iduserpertama)) {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserpertama,
            status: el.status,
            statusNotif: el.statusNotif,
            chat: el.chats[0].iduser,
            username: el.chats[0].usernameuser,
          };
          return dataArray;
        }
      }
    });
    res.send(hasil);
  }
};

const updateStatusPersonalChat = async (req, res) => {
  PersonalChatSaika.findOneAndUpdate(
    {
      _id: req.params.idchat,
    },
    {
      $set: {
        status: "null",
        statusNotif: "null",
      },
    }
  ).then(() => {
    res.send({ status: "success" });
  });
};

const updateNotifStatusPersonalChat = async (req, res) => {
  PersonalChatSaika.findOneAndUpdate(
    {
      _id: req.params.idchat,
    },
    {
      $set: {
        statusNotif: "null",
      },
    }
  ).then(() => {
    res.send({ status: "success" });
  });
};

const sendPersonalChats = async (data) => {
  const [dataChat, dataUser] = await Promise.all([PersonalChatSaika.findOne({ _id: data.idchat }), UserTestSaika.findOne({ _id: Object(data.iduser) })]);

  let bulan = new Date().getMonth();
  let tahun = new Date().getFullYear();
  let tanggal = new Date().getDate();
  let jam = new Date().getHours();
  let menit = new Date().getMinutes();
  let tanggalKirim = `${tanggal} ${namesSetMonth(bulan, "id-ID")} ${tahun}`;
  let jamKirim = `${setIndeksHours(jam.toString())}:${setIndeksHours(menit.toString())}`;

  let dataKirim = {
    iduser: data.iduser,
    usernameuser: dataUser.username,
    waktu: jamKirim,
    tanggal: tanggalKirim,
    pesan: data.pesanKirim,
  };

  if (dataChat && dataUser) {
    const result = await PersonalChatSaika.findOneAndUpdate(
      { _id: data.idchat },
      {
        $set: {
          status: "active",
          statusNotif: "active",
          chats: [dataKirim, ...dataChat.chats],
        },
      }
    );
    const dataChatNew = await PersonalChatSaika.findOne({ _id: data.idchat });
    if (result && dataChatNew) {
      return { result, dataChatNew };
    }
  }
};

module.exports = { checkRoomPersonalChat, getPersonalChat, getAllPersonalChat, updateStatusPersonalChat, updateNotifStatusPersonalChat, sendPersonalChats };
