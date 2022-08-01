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
    const cekUser = await UserTestSaika.findOne({ iduser: Object(data.iduser) });
    if (cekUser) {
      socket.to(data.idroom).emit("anggota_keluar_notif", cekUser.nama);
    }
  });

  socket.on("keluar_room", async (data) => {
    console.log(data);
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
            socket.to(data.idroom).emit("data_anggota", dataChatNew);
          });
        } else {
          socket.to(data.idroom).emit("data_anggota", cekAnggotaRoom);
        }
      });
    }
  });
});

app.use(router);

server.listen(3001, () => {
  console.log("Server is running");
});
