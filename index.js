const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
require("./utils/db");
const UserTestSaika = require("./model/User");
const ChatsSaika = require("./model/Chats");
const { namesSetMonth, setIndeksHours } = require("./utils/numberFormat");
dotenv.config();
const http = require("http");
const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const router = require("./routes/index");

const cors = require("cors");
const { isObjectIdOrHexString } = require("mongoose");
const PersonalChatSaika = require("./model/PersonalChats");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: ["http://localhost:3002", "http://localhost:3000"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: "saikas3cret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("mys3cret"));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("data_user", (data) => {
    console.log(data);
    socket.join(data);
  });

  socket.on("update_data_user", async (data) => {
    console.log(data);
    const dataUserUpdateSend = await UserTestSaika.findOne({ _id: data.pengirim });
    const dataUserUpdateReceive = await UserTestSaika.findOne({ _id: data.penerima });
    if (dataUserUpdateReceive) {
      socket.to(data.pengirim).emit("data_user_send", dataUserUpdateSend);
      socket.to(data.penerima).emit("data_user_receive", dataUserUpdateReceive);
    }
  });

  socket.on("send_message", async (data) => {
    const dataChat = await ChatsSaika.findOne({ idroom: data.idroom });
    const dataUser = await UserTestSaika.findOne({ _id: Object(data.iduser) });
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
    if (dataChat) {
      ChatsSaika.updateOne(
        { idroom: data.idroom },
        {
          $set: {
            chats: [dataKirim, ...dataChat.chats],
          },
        }
      ).then(async () => {
        const dataChatNew = await ChatsSaika.findOne({ idroom: data.idroom });

        socket.to(data.idroom).emit("pesan_terima", dataChatNew);
        // socket.broadcast.emit("pesan_terima", dataChatNew);
      });
    }
  });

  socket.on("data_anggota", async (data) => {
    const cekRoom = await ChatsSaika.findOne({ idroom: data });
    if (cekRoom) {
      socket.to(data).emit("data_anggota", cekRoom);
    }
  });

  socket.on("anggota_keluar", async (data) => {
    const cekUser = await UserTestSaika.findOne({ _id: data.iduser });
    const cekRoom = await ChatsSaika.findOne({ idroom: data.idroom });
    if (cekUser) {
      let dataKirim = {
        kondisi: "keluar",
        namauser: cekUser.nama,
      };
      ChatsSaika.updateOne(
        { idroom: data.idroom },
        {
          $set: {
            chats: [dataKirim, ...cekRoom.chats],
          },
        }
      ).then(async () => {
        const dataChatNew = await ChatsSaika.findOne({ idroom: data.idroom });
        socket.to(data.idroom).emit("pesan_terima", dataChatNew);
      });
    }
  });

  socket.on("anggota_masuk", async (data) => {
    const cekUser = await UserTestSaika.findOne({ _id: data.iduser });
    const cekRoom = await ChatsSaika.findOne({ idroom: data.idroom });
    if (cekUser) {
      let dataChats = cekRoom.chats.map((el) => {
        if (el.kondisi === "masuk") {
          return el.iduser;
        }
      });
      if (!dataChats.includes(data.iduser)) {
        let dataKirim = {
          iduser: data.iduser,
          kondisi: "masuk",
          namauser: cekUser.nama,
        };
        ChatsSaika.updateOne(
          { idroom: data.idroom },
          {
            $set: {
              chats: [dataKirim, ...cekRoom.chats],
            },
          }
        ).then(async () => {
          const dataChatNew = await ChatsSaika.findOne({ idroom: data.idroom });
          socket.to(data.idroom).emit("pesan_terima", dataChatNew);
        });
      }
    }
  });

  socket.on("keluar_room", async (data) => {
    const cekRoom = await ChatsSaika.findOne({ idroom: data.idroom });
    if (cekRoom) {
      let sisaAnggota = cekRoom.anggota.filter((el) => el.iduser !== data.iduser);
      // let sisaAnggota =
      ChatsSaika.updateOne(
        { idroom: data.idroom },
        {
          $set: {
            anggota: [...sisaAnggota],
          },
        }
      ).then(async () => {
        const cekAnggotaRoom = await ChatsSaika.findOne({ idroom: data.idroom });
        if (cekAnggotaRoom.anggota.length === 0) {
          ChatsSaika.deleteOne({ idroom: data.idroom }).then(() => {
            const dataChatNew = null;
            socket.to(data.idroom).emit("data_anggota_sisa", dataChatNew);
          });
        } else {
          socket.to(data.idroom).emit("data_anggota_sisa", cekAnggotaRoom);
        }
      });
    }
  });

  socket.on("send_message_pc", async (data) => {
    const dataChat = await PersonalChatSaika.findOne({ _id: data.idchat });
    const dataUser = await UserTestSaika.findOne({ _id: Object(data.iduser) });
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
    if (dataChat) {
      PersonalChatSaika.updateOne(
        { _id: data.idchat },
        {
          $set: {
            status: "active",
            chats: [dataKirim, ...dataChat.chats],
          },
        }
      ).then(async () => {
        const dataChatNew = await PersonalChatSaika.findOne({ _id: data.idchat });
        if (dataChatNew) {
          socket.to(dataChatNew.iduserpertama).to(dataChatNew.iduserkedua).emit("pesan_terima_pc", dataChatNew);
        }
        // socket.broadcast.emit("pesan_terima", dataChatNew);
      });
    }
  });

  socket.on("active_message", async (data) => {
    //data.iduser: pengirimPesan
    const dataChat = await PersonalChatSaika.findOne({ _id: data.idchat });
    if (dataChat) {
      PersonalChatSaika.updateOne(
        { _id: data.idchat },
        {
          $set: {
            status: "active",
          },
        }
      ).then(async () => {
        //LOGIKANYA SALAH
        const personalChat1 = await PersonalChatSaika.find({ iduserpertama: data.iduser });
        const personalChat2 = await PersonalChatSaika.find({ iduserkedua: data.iduser });
        const dataUser = await UserTestSaika.findOne({ _id: data.iduser });

        let dataGabung = [...personalChat1, ...personalChat2];
        if (dataUser) {
          let dataFriend = dataUser.listFriends.map((el) => el.iduser);

          let hasil = dataGabung.map((el) => {
            if (el.iduserpertama === data.iduser) {
              let dataArray = {
                idchat: el._id,
                idfriend: el.iduserpertama,
                status: el.status,
                chat: el.chats[0].iduser,
              };
              return dataArray;
            } else {
              let dataArray = {
                idchat: el._id,
                idfriend: el.iduserkedua,
                status: el.status,
                chat: el.chats[0].iduser,
              };

              return dataArray;
            }
          });
          console.log(hasil);
          socket.to(dataChat.iduserpertama).to(dataChat.iduserkedua).emit("pesan_aktif", hasil);
        }
      });
    }
  });

  socket.on("close_active_message", async (data) => {
    const dataChat = await PersonalChatSaika.findOne({ _id: data.idchat });

    const personalChat1 = await PersonalChatSaika.find({ iduserpertama: data.iduser });
    const personalChat2 = await PersonalChatSaika.find({ iduserkedua: data.iduser });
    const dataUser = await UserTestSaika.findOne({ _id: data.iduser });

    let dataGabung = [...personalChat1, ...personalChat2];
    if (dataUser) {
      let hasil = dataGabung.map((el) => {
        if (el.iduserpertama === data.iduser) {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserkedua,
            status: el.status,
            chat: el.chats[0].iduser,
          };
          return dataArray;
        } else {
          let dataArray = {
            idchat: el._id,
            idfriend: el.iduserpertama,
            status: el.status,
            chat: el.chats[0].iduser,
          };
          return dataArray;
        }
      });
      socket.to(data.iduser).emit("pesan_aktif", hasil);
    }
  });
});

app.use(router);

server.listen(3001, () => {
  console.log("Server is running");
});
