const PersonalChatSaika = require("../model/PersonalChats");
const UserTestSaika = require("../model/User");
const { returnFormatDate } = require("../utils/numberFormat");
const io = require("socket.io-client");

const socket = io.connect("http://localhost:3001");

const checkRoomPersonalChat = async (req, res) => {
  const [checkRoomPengirim, checkRoomPenerima] = await Promise.all([
    PersonalChatSaika.findOne({ iduserpertama: req.params.iduser, iduserkedua: req.body.iduserreceive }),
    PersonalChatSaika.findOne({ iduserpertama: req.body.iduserreceive, iduserkedua: req.params.iduser }),
  ]);
  if (checkRoomPengirim || checkRoomPenerima) {
    let dataRoom = !checkRoomPenerima ? checkRoomPengirim : checkRoomPenerima;
    let dataUser = { userSend: req.params.iduser, userReceive: req.body.iduserreceive };
    let room = await getPersonalChatV2(dataRoom, dataUser);

    const dataKirim = {
      idchat: dataRoom._id,
      iduser: req.params.iduser,
      idfriend: req.body.iduserreceive,
    };
    socket.emit("active_or_close_message", dataKirim);

    res.send(room);
  } else {
    const [userSender, userReceiver] = await Promise.all([UserTestSaika.findOne({ _id: req.params.iduser }), UserTestSaika.findOne({ _id: req.body.iduserreceive })]);

    if (userSender && userReceiver) {
      let dataMasuk = {
        iduserpertama: req.params.iduser,
        iduserkedua: req.body.iduserreceive,
        statusChatUserPertama: "null",
        statusChatUserKedua: "null",
        statusNotifUserPertama: "null",
        statusNotifUserKedua: "null",
        chats: [],
      };
      PersonalChatSaika.create({ ...dataMasuk }).then(async () => {
        const [checkRoomPengirim, checkRoomPenerima] = await Promise.all([
          PersonalChatSaika.findOne({ iduserpertama: req.params.iduser, iduserkedua: req.body.iduserreceive }),
          PersonalChatSaika.findOne({ iduserpertama: req.body.iduserreceive, iduserkedua: req.params.iduser }),
        ]);
        if (checkRoomPengirim || checkRoomPenerima) {
          let dataRoom = !checkRoomPenerima ? checkRoomPengirim : checkRoomPenerima;
          res.send(dataRoom);
        }
        console.log("datauser", req.params.iduser, req.body.iduserreceive);
        console.log("dataroom", checkRoomPengirim, checkRoomPenerima);
      });
    }
  }
};

const getPersonalChatV2 = async (dataChat, dataUser) => {
  const updateStatus = await PersonalChatSaika.findOneAndUpdate(
    {
      _id: dataChat._id,
    },
    {
      $set: {
        statusChatUserPertama: dataUser.userSend === dataChat.iduserpertama && dataUser.userReceive === dataChat.iduserkedua ? "null" : dataChat.statusChatUserPertama,
        statusNotifUserPertama: dataUser.userSend === dataChat.iduserpertama && dataUser.userReceive === dataChat.iduserkedua ? "null" : dataChat.statusNotifUserPertama,
        statusChatUserKedua: dataUser.userSend === dataChat.iduserkedua && dataUser.userReceive === dataChat.iduserpertama ? "null" : dataChat.statusChatUserKedua,
        statusNotifUserKedua: dataUser.userSend === dataChat.iduserkedua && dataUser.userReceive === dataChat.iduserpertama ? "null" : dataChat.statusNotifUserKedua,
      },
    }
  );
  if (updateStatus) {
    const dataRoomPersonalChat = await PersonalChatSaika.findOne({ _id: dataChat._id });
    return dataRoomPersonalChat;
  }
};

const getAllPersonalChatV2 = async (req, res) => {
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });
  if (dataUser) {
    let dataFriend = dataUser.listFriends.map((el) => el.iduser); // buat ngembaliin ID temen2nya
    if (dataFriend.length === 0) {
      let hasil = [];
      res.send(hasil);
    } else {
      let hasil = await getAllPersonalChatV2withOutReq(dataFriend, req.params.iduser);

      res.send(hasil);
    }
  }
};

const getAllPersonalChatV2withOutReq = async (dataFriend, iduser) => {
  let hasil = [];
  for (let i = 0; i < dataFriend.length; i++) {
    const [profileFriend, checkRoomPengirim, checkRoomPenerima] = await Promise.all([
      UserTestSaika.findOne({ _id: dataFriend[i] }, { nama: 1, username: 1, fotoUser: 1 }),
      PersonalChatSaika.findOne({ iduserpertama: iduser, iduserkedua: dataFriend[i] }, { chats: 0 }),
      PersonalChatSaika.findOne({ iduserpertama: dataFriend[i], iduserkedua: iduser }, { chats: 0 }),
    ]);
    let dataProfileFriend = {
      iduser: dataFriend[i],
      fotoProfil: profileFriend.fotoUser.fotoUrl,
      nama: profileFriend.nama,
      username: profileFriend.username,
    };
    let dataChat = !checkRoomPenerima ? checkRoomPengirim : checkRoomPenerima;

    hasil.push({ ...dataProfileFriend, dataChat });
  }
  let result = hasil.sort((a, b) => new Date(b.dataChat.updatedAt) - new Date(a.dataChat.updatedAt));

  return result;
};

const activeOrCloseMessageV2 = async (data) => {
  const [dataUser, dataFriend] = await Promise.all([UserTestSaika.findOne({ _id: data.iduser }, { listFriends: 1 }), UserTestSaika.findOne({ _id: data.idfriend }, { listFriends: 1 })]);

  if (dataUser) {
    let dataFriendforUser = dataUser.listFriends.map((el) => el.iduser); // buat ngembaliin ID temen2nya
    let dataFriendforFriend = dataFriend.listFriends.map((el) => el.iduser); // buat ngembaliin ID temen2nya
    if (dataFriendforUser.length === 0 || dataFriendforFriend.length === 0) {
      let hasil = [];
      return hasil;
    } else {
      let hasilUser = await getAllPersonalChatV2withOutReq(dataFriendforUser, data.iduser);
      let hasilFriend = await getAllPersonalChatV2withOutReq(dataFriendforFriend, data.idfriend);

      return { value: true, hasilUser, hasilFriend };
    }
  }
};

const getListWaitingFriendV2 = async (req, res) => {
  const dataUser = await UserTestSaika.findOne({ _id: req.params.iduser });
  if (dataUser) {
    let dataFriend = dataUser.listWaitingReceive.map((el) => el.iduser); // buat ngembaliin ID temen2nya
    if (dataFriend.length === 0) {
      let hasil = [];
      res.send(hasil);
    } else {
      let hasil = [];
      for (let i = 0; i < dataFriend.length; i++) {
        const profileFriend = await UserTestSaika.findOne({ _id: dataFriend[i] }, { nama: 1, username: 1, fotoUser: 1 });

        let dataProfileFriend = {
          iduser: dataFriend[i],
          fotoProfil: profileFriend.fotoUser.fotoUrl,
          nama: profileFriend.nama,
          username: profileFriend.username,
        };
        hasil.push({ ...dataProfileFriend });
      }
      res.send(hasil);
    }
  }
};

const sendPersonalChats = async (data) => {
  console.log(data);
  const [dataChat, dataUser] = await Promise.all([PersonalChatSaika.findOne({ _id: data.idchat }), UserTestSaika.findOne({ _id: Object(data.iduser) })]);

  const formatDate = returnFormatDate();

  let dataKirim = {
    iduser: data.iduser,
    usernameuser: dataUser.username,
    waktu: formatDate.jamKirim,
    tanggal: formatDate.tanggalKirim,
    pesan: data.pesanKirim,
  };

  if (dataChat && dataUser) {
    const result = await PersonalChatSaika.findOneAndUpdate(
      { _id: data.idchat },
      {
        $set: {
          statusChatUserPertama: data.iduser === dataChat.iduserpertama && data.idfriend === dataChat.iduserkedua ? "null" : "active",
          statusNotifUserPertama: data.iduser === dataChat.iduserpertama && data.idfriend === dataChat.iduserkedua ? "null" : "active",
          statusChatUserKedua: data.iduser === dataChat.iduserkedua && data.idfriend === dataChat.iduserpertama ? "null" : "active",
          statusNotifUserKedua: data.iduser === dataChat.iduserkedua && data.idfriend === dataChat.iduserpertama ? "null" : "active",
          chats: [dataKirim, ...dataChat.chats],
          updatedAt: new Date(),
        },
      }
    );

    const newResult = await PersonalChatSaika.findOne({ _id: data.idchat });

    if (result) {
      return { newResult };
    }
  }
};

module.exports = {
  checkRoomPersonalChat,
  sendPersonalChats,
  getAllPersonalChatV2,
  getListWaitingFriendV2,
  getAllPersonalChatV2withOutReq,
  activeOrCloseMessageV2,
};
