const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const busboy = require("connect-busboy");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
require("./utils/db");

const UserTestSaika = require("./model/User");
const ChatsSaika = require("./model/Chats");

const { sendPersonalChats, closedMessage } = require("./controller/PersonalChat");
const { addPesan, notifKeluar, keluarRoom, notifMasuk } = require("./controller/Chats");

dotenv.config();

const http = require("http");
const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");
const router = require("./routes/index");

const cors = require("cors");

app.use(bodyParser.json());
app.use(busboy());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
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
  let dataUser, joinRoom;

  socket.on("join_room", (data) => {
    joinRoom = data;
    socket.join(data);
  });
  socket.on("data_user", (data) => {
    dataUser = data;
    socket.join(data);
  });

  socket.on("update_data_user", async (data) => {
    const [dataUserUpdateSend, dataUserUpdateReceive] = await Promise.all([UserTestSaika.findOne({ _id: data.pengirim }), UserTestSaika.findOne({ _id: data.penerima })]);

    if (dataUserUpdateReceive && dataUserUpdateSend) {
      socket.to(data.pengirim).emit("data_user_send", dataUserUpdateSend);
      socket.to(data.penerima).emit("data_user_receive", dataUserUpdateReceive);
    }
  });

  socket.on("cek_anggota", async (data) => {
    const dataAnggotaUpdate = await ChatsSaika.findOne({ idroom: data });
    if (dataAnggotaUpdate) {
      socket.to(data).emit("anggota_update", dataAnggotaUpdate.anggota);
    }
  });

  socket.on("send_message", async (data) => {
    const result = await addPesan(data);

    if (result) {
      socket.to(data.idroom).emit("pesan_terima", result.dataChatNew);
    }
  });

  socket.on("data_anggota", async (data) => {
    const cekRoom = await ChatsSaika.findOne({ idroom: data });
    if (cekRoom) {
      socket.to(data).emit("data_anggota", cekRoom);
    }
  });

  socket.on("anggota_keluar", (data) => {
    const result = notifKeluar(data);
    if (result?.value) {
      socket.to(data.idroom).emit("pesan_terima", result.dataChatNew);
    }
  });

  socket.on("anggota_masuk", async (data) => {
    const result = notifMasuk(data);
    if (result?.value) {
      socket.to(data.idroom).emit("pesan_terima", result.dataChatNew);
    }
  });

  socket.on("keluar_room", async (data) => {
    const result = await keluarRoom(data);
    if (result?.value) {
      socket.to(data.idroom).emit("data_anggota_sisa", result.dataNew);
    }
  });

  socket.on("send_message_pc", async (data) => {
    const result = await sendPersonalChats(data);
    if (result.result) {
      socket.to(result.result.iduserpertama).to(result.result.iduserkedua).emit("pesan_terima_pc", result.result);
    }
  });

  socket.on("active_message", async (data) => {
    const result = await activeMessage(data);
    if (result?.value) {
      socket.to(dataChat.iduserpertama).to(dataChat.iduserkedua).emit("pesan_aktif", result.hasil);
    }
  });

  socket.on("close_active_message", async (data) => {
    const result = await closedMessage(data);
    if (result?.value) {
      socket.to(data.iduser).emit("pesan_aktif", result.hasil);
    }
  });

  socket.on("disconnect", async function () {
    let data = {
      iduser: undefined,
      idroom: undefined,
    };

    if (dataUser !== undefined) {
      data.iduser = dataUser;
    }
    if (joinRoom !== undefined) {
      data.idroom = joinRoom;
    }
    let waitData = new Promise((fulfill, reject) => {
      if (data.iduser !== undefined && data.idroom !== undefined) {
        return fulfill(data);
      }
    });
    waitData.then(async (res) => {
      const resultAnggota = await keluarRoom(data);
      // console.log(resultAnggota.dataNew);
      const resultNotif = await notifKeluar(res);

      if (resultAnggota?.value === resultNotif?.value) {
        socket.to(res.idroom).emit("data_anggota_sisa", resultAnggota.dataNew);
        socket.to(res.idroom).emit("pesan_terima", resultNotif.dataChatNew);
      }
    });

    // console.log(waitData);
  });
});

app.use(router);

server.listen(3001, () => {
  console.log("Server is running");
});
