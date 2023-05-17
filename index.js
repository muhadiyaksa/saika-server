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

const { sendPersonalChats, activeOrCloseMessageV2 } = require("./controller/PersonalChat");
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
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
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
    console.log("user", data);
  });

  socket.on("update_data_user", async (data) => {
    const [dataUserUpdateSend, dataUserUpdateReceive] = await Promise.all([UserTestSaika.findOne({ _id: data.pengirim }), UserTestSaika.findOne({ _id: data.penerima })]);

    if (dataUserUpdateReceive && dataUserUpdateSend) {
      io.to(data.pengirim).emit("data_user_send", dataUserUpdateSend);
      io.to(data.penerima).emit("data_user_receive", dataUserUpdateReceive);
    }
  });

  socket.on("cek_anggota", async (data) => {
    const dataAnggotaUpdate = await ChatsSaika.findOne({ idroom: data });
    if (dataAnggotaUpdate) {
      io.to(data).emit("anggota_update", dataAnggotaUpdate.anggota);
    }
  });

  socket.on("send_message", async (data) => {
    const result = await addPesan(data);
    console.log("data send message =>>>>>", data);

    if (result) {
      io.to(data.idroom).emit("pesan_terima", result.dataChatNew);
    }
  });

  socket.on("data_anggota", async (data) => {
    const cekRoom = await ChatsSaika.findOne({ idroom: data });
    if (cekRoom) {
      io.to(data).emit("data_anggota", cekRoom);
    }
  });

  socket.on("anggota_keluar", (data) => {
    const result = notifKeluar(data);
    if (result?.value) {
      io.to(data.idroom).emit("pesan_terima", result.dataChatNew);
    }
  });

  socket.on("anggota_masuk", async (data) => {
    const result = await notifMasuk(data);
    console.log("notif masuk =>>>>>>>>>>>>>>>>>>>>", result);
    if (result?.value) {
      io.to(data.idroom).emit("pesan_terima", result.dataChatNew);
      io.to(data.idroom).emit("data_anggota_baru", result.isNew);
    }
  });

  socket.on("keluar_room", async (data) => {
    const result = await keluarRoom(data);
    if (result?.value) {
      io.to(data.idroom).emit("data_anggota_sisa", result.dataNew);
    }
  });

  socket.on("send_message_pc", async (data) => {
    const result = await sendPersonalChats(data);
    if (result.newResult) {
      io.to(result.newResult.iduserpertama).to(result.newResult.iduserkedua).emit("pesan_terima_pc", result.newResult);
    }
  });

  socket.on("active_or_close_message", async (data) => {
    const result = await activeOrCloseMessageV2(data);
    if (result?.value) {
      io.to(data.iduser).emit("pesan_aktif", result.hasilUser);
      io.to(data.idfriend).emit("pesan_aktif", result.hasilFriend);
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
      const resultNotif = await notifKeluar(res);

      console.log(resultAnggota);
      if (resultAnggota?.value === resultNotif?.value) {
        io.to(res.idroom).emit("data_anggota_sisa", resultAnggota?.dataNew);
        io.to(res.idroom).emit("pesan_terima", resultNotif?.dataChatNew);
      }
    });

    // console.log(waitData);
  });
});

app.use(router);

server.listen(3001, () => {
  console.log("Server is running");
});
