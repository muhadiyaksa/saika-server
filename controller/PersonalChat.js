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

const getPersonalChat = async (req, res) => {
  const [dataUser, dataChat, dataChat2] = await Promise.all([UserTestSaika.findOne({ _id: req.params.iduser }), PersonalChatSaika.find({ iduserpertama: req.params.iduser }), PersonalChatSaika.find({ iduserkedua: req.params.iduser })]);

  // Cukup ambil dari parameter ID Chat
  // Update statusChat and statusNotif
  // Kalo misal iduserpertama ===  req.params.iduser (ini tandanya update statusChat dan statuNotif untuk UserKedua)
  // Kalo misal iduserpertama !==  req.params.iduser (ini tandanya update statusChat dan statuNotif untuk UserPertama)
  // Lalu Balikin Hasil dari findAll PersonalChat dari user yang punya id masing2
  if (dataUser && dataChat && dataChat2) {
    let gabunganDataChat = [...dataChat, ...dataChat2];
    let dataFriend = dataUser.listFriends.map((el) => el.iduser);
    let hasil = gabunganDataChat.map((el) => {
      if (el.iduserpertama === req.params.iduser) {
        if (dataFriend.includes(el.iduserkedua)) {
          let dataMasuk = {
            idfriend: el.iduserkedua,
            status: el.chats[0]?.iduser !== req.params.iduser ? "active" : "null",
            statusNotif: el.chats[0]?.iduser !== req.params.iduser ? "active" : "null",
          };

          return dataMasuk;
        }
      } else {
        if (dataFriend.includes(el.iduserpertama)) {
          let dataMasuk = {
            idfriend: el.iduserpertama,
            status: el.chats[0]?.iduser !== req.params.iduser ? "active" : "null",
            statusNotif: el.chats[0]?.iduser !== req.params.iduser ? "active" : "null",
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
    let dataFriend = dataUser.listFriends.map((el) => el.iduser); // buat ngembaliin ID temen2nya
    console.log("datagabung", dataGabung);

    let hasil = dataGabung.map((el) => {
      if (el.iduserpertama === req.params.iduser) {
        if (dataFriend.includes(el.iduserkedua)) {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserkedua,
            status: el.status,
            statusNotif: el.statusNotif,
            iduserLastSender: el.chats[0]?.iduser || null,
            // username: el.chats[0]?.usernameuser || null,
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
            iduserLastSender: el.chats[0]?.iduser || null,
            // username: el.chats[0]?.usernameuser || null,
          };
          return dataArray;
        }
      }
    });
    console.log("hasil", hasil);
    res.send(hasil);
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

  return hasil;
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
  console.log("yaaa param", req.params.idchat);
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

const sendPersonalChatsV2 = async (req, res) => {
  const dataKirim = {
    idchat: req.body.idchat,
    iduser: req.params.iduser,
    idfriend: req.body.idfriend,
    pesanKirim: req.body.pesanKirim,
  };

  socket.emit("send_message_pc", dataKirim);
  socket.emit("active_or_close_message", dataKirim);
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
        },
      }
    );

    const newResult = await PersonalChatSaika.findOne({ _id: data.idchat });

    if (result) {
      return { newResult };
    }
  }
};

const activeMessage = async (data) => {
  console.log("active message", data);
  const dataChat = await PersonalChatSaika.findOne({ _id: data.idchat });
  if (dataChat) {
    let result = await PersonalChatSaika.updateOne(
      { _id: data.idchat },
      {
        $set: {
          status: "active",
          statusNotif: "active",
        },
      }
    );
    if (result) {
      // ini buat apaan ya
      const [personalChat1, personalChat2, dataUser] = await Promise.all([PersonalChatSaika.find({ iduserpertama: data.iduser }), PersonalChatSaika.find({ iduserkedua: data.iduser }), UserTestSaika.findOne({ _id: data.iduser })]);
      let idPenerimaNotif;
      if (dataUser && personalChat2 && personalChat1) {
        let dataGabung = [...personalChat1, ...personalChat2];

        let hasil = dataGabung.map((el) => {
          if (el.iduserpertama === data.iduser) {
            idPenerimaNotif = el.iduserkedua;
            let dataArray = {
              idchat: el._id,
              idfriend: el.iduserpertama,
              status: el.status,
              statusNotif: el.statusNotif,
              iduserLastSender: el.chats[0]?.iduser || null,
              // username: el.chats[0]?.usernameuser || null,
            };
            return dataArray;
          } else {
            idPenerimaNotif = el.iduserpertama;

            let dataArray = {
              idchat: el._id,
              idfriend: el.iduserkedua,
              status: el.status,
              statusNotif: el.statusNotif,
              iduserLastSender: el.chats[0]?.iduser || null,
              // username: el.chats[0]?.usernameuser || null,
            };

            return dataArray;
          }
        });
        return { value: true, idPenerimaNotif, hasil };
      }
    }
  }
};

const closedMessage = async (data) => {
  const [personalChat1, personalChat2, dataUser] = await Promise.all([PersonalChatSaika.find({ iduserpertama: data.iduser }), PersonalChatSaika.find({ iduserkedua: data.iduser }), UserTestSaika.findOne({ _id: data.iduser })]);

  if ((dataUser && personalChat1, personalChat2)) {
    let dataGabung = [...personalChat1, ...personalChat2];
    let hasil = dataGabung.map((el) => {
      if (el.iduserpertama === data.iduser) {
        let dataArray = {
          idchat: el._id,
          idfriend: el.iduserkedua,
          status: el.status,
          statusNotif: el.statusNotif,
          iduserLastSender: el.chats[0]?.iduser || null,
          // username: el.chats[0]?.usernameuser || null,
        };
        return dataArray;
      } else {
        let dataArray = {
          idchat: el._id,
          idfriend: el.iduserpertama,
          status: el.status,
          statusNotif: el.statusNotif,
          iduserLastSender: el.chats[0]?.iduser || null,
          // username: el.chats[0]?.usernameuser || null,
        };
        return dataArray;
      }
    });
    return { value: true, hasil };
  }
};
module.exports = {
  checkRoomPersonalChat,
  getPersonalChat,
  getAllPersonalChat,
  updateStatusPersonalChat,
  updateNotifStatusPersonalChat,
  sendPersonalChats,
  activeMessage,
  closedMessage,
  getAllPersonalChatV2,
  getListWaitingFriendV2,
  getAllPersonalChatV2withOutReq,
  activeOrCloseMessageV2,
  sendPersonalChatsV2,
};
