const UserTestSaika = require("../model/User");
const ChatsSaika = require("../model/Chats");
const Event = require("../model/Event");
const crypto = require("crypto");
const { returnFormatDate } = require("../utils/numberFormat");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const buatRoom = async (req, res) => {
  const cekRuangDiskusi = await ChatsSaika.find({ kategori: req.body.kategori });
  if (cekRuangDiskusi.length === 0) {
    let anggota;
    console.log("masuk sini", req.body.namauser);
    if (req.body.tipeUser === "unregistered") {
      anggota = {
        iduser: req.body.iduser,
        usernameuser: "anonymous",
      };
    } else {
      anggota = {
        iduser: req.body.iduser,
        fotoUser: req.body.fotoUser,
        namauser: req.body.namauser,
        usernameuser: req.body.usernameuser,
      };
    }
    const dataMasuk = {
      idroom: crypto.randomBytes(64).toString("hex"),
      kategori: req.body.kategori,
      anggota: [anggota],
      createdAt: new Date(),
    };
    ChatsSaika.insertMany(dataMasuk, (error, result) => {
      res.send({ status: "waiting" });
    });
  } else {
    const cekAnggotaRuangDiskusi = await ChatsSaika.findOne({ kategori: req.body.kategori });
    if (cekAnggotaRuangDiskusi) {
      let dataAnggota = cekAnggotaRuangDiskusi.anggota.map((el) => el.iduser);
      if (dataAnggota.includes(req.body.iduser)) {
        //buat ngecek ni ada ga nih dia di ruangannya, kalo ada (includes) yaudah gausah dimasukin sampe nemu anggota baru
        if (dataAnggota.length > 1 && req.body.percobaan <= 20) {
          res.send({ status: "finish", idroom: cekAnggotaRuangDiskusi.idroom });
        } else if (dataAnggota.length === 1 && req.body.percobaan <= 20) {
          res.send({ status: "waiting" });
        } else {
          ChatsSaika.deleteMany({ idroom: cekAnggotaRuangDiskusi.idroom })
            .then(() => {
              res.send({ status: "rejected" });
            })
            .catch((err) => {
              res.status(404).send({
                status: "failed",
                message: "Data Gagal Di Delete",
              });
            });
        }
      } else {
        if (req.body.percobaan === 0) {
          res.send({ status: "waiting" });
        } else {
          // const dataUser = {
          //   iduser: req.body.iduser,
          //   fotoUser: req.body.fotoUser,
          //   namauser: req.body.namauser,
          //   usernameuser: req.body.usernameuser,
          // };
          let dataUser;
          if (req.body.tipeUser === "unregistered") {
            dataUser = {
              iduser: req.body.iduser,
              usernameuser: "anonymous",
            };
          } else {
            dataUser = {
              iduser: req.body.iduser,
              fotoUser: req.body.fotoUser,
              namauser: req.body.namauser,
              usernameuser: req.body.usernameuser,
            };
          }
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
const joinRoom = async (req, res) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: req.params.idroom });
  if (cekRoom) {
    let idAnggota = cekRoom.anggota.map((el) => el.iduser);

    if (idAnggota.includes(req.body.iduser)) {
      res.send({ status: "finish", idroom: cekRoom.idroom });
    } else {
      let dataUser = {
        iduser: req.body.iduser,
        fotoUser: req.body.fotoUser,
        namauser: req.body.namauser,
        usernameuser: req.body.usernameuser,
      };
      ChatsSaika.updateOne(
        { idroom: req.params.idroom },
        {
          $set: {
            anggota: [...cekRoom.anggota, dataUser],
          },
        }
      )
        .then(() => {
          res.send({ status: "finish", idroom: cekRoom.idroom });
        })
        .catch((err) => {
          console.log(err);
          res.status(404).send({
            status: "failed",
            message: "Gagal Masuk Room",
          });
        });
    }
  } else {
    res.status(404).send({
      status: "failed",
      message: "Data Tidak Ditemukan",
    });
  }
};
const getRoom = async (req, res) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: req.params.idroom });
  if (cekRoom) {
    res.send(cekRoom);
  } else {
    res.status(404).send({
      status: "failed",
      message: "Data Tidak Ditemukan",
    });
  }
};

const addPesan = async (data) => {
  const dataChat = await ChatsSaika.findOne({ idroom: data.idroom });

  if (dataChat) {
    const formatDate = returnFormatDate();
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    let dataLimitAnonymous = dataChat.chats.filter((el) => el.iduser?.includes("anonymous") && el.pesan && el.iduser === data.iduser);
    if (dataLimitAnonymous.length > 10) {
      return { value: true, message: "Limit Sudah Mencapai Batasnya", dataChatNew: dataChat };
    }

    let uploadFromBuffer = (image) => {
      return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: "chat",
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(image).pipe(cld_upload_stream);
      });
    };

    let upload = data.uploadFile ? await uploadFromBuffer(data.image) : "";

    let dataKirim = {
      iduser: data.iduser,
      usernameuser: data.username,
      waktu: formatDate.jamKirim,
      tanggal: formatDate.tanggalKirim,
      pesan: data.pesanKirim,
      image: data.uploadFile ? true : false,
      imageName: data.uploadFile ? `${upload.public_id}.${upload.format}` : "",
      imageUrl: data.uploadFile ? upload.url : "",
    };

    let dataChatLength = [];
    let dataHighlight = [];
    let dataChatSort = dataChat.chats.sort((a, b) => b - a);
    console.log("dataSort", dataChatSort);
    for (let i = dataChat.chats.length - 1; i >= 0; i--) {
      if (dataChat.chats[i].pesan || dataChat.chats[i].image) {
        dataChatLength.push(dataChat.chats[i]);
      }
      if (dataChat.chats[i].hightlight) {
        dataChatLength.splice(0);
        console.log("masuk sini");
      }
    }

    if (dataChatLength.length > 10) {
      let dataIDHighlight = dataChat.chats.filter((el) => {
        if (el.highlight) return el._id;
      });
      const eventsCatg = await Event.findOne({ eventCategory: dataChat.kategori, _id: { $nin: dataIDHighlight } });
      if (eventsCatg) {
        let dataKirim = {
          waktu: formatDate.jamKirim,
          tanggal: formatDate.tanggalKirim,
          hightlight: true,
          idHighlight: eventsCatg._id,
          eventImage: eventsCatg.eventImage,
          eventName: eventsCatg.eventName,
          institution: eventsCatg.institution,
          eventCategory: eventsCatg.eventCategory,
          eventDate: eventsCatg.eventDate,
          paymentType: eventsCatg.paymentType,
          price: eventsCatg.price,
        };
        dataHighlight.push(dataKirim);
        console.log("eventsCatg", dataKirim);
      }
    }

    // if(dataChat.chats)
    const result = await ChatsSaika.findOneAndUpdate(
      { idroom: data.idroom },
      {
        $set: {
          chats: [...dataHighlight, dataKirim, ...dataChat.chats],
        },
      }
    );
    if (result) {
      const dataChatNew = await ChatsSaika.findOne({ idroom: data.idroom });
      dataHighlight.length = 0;
      dataChatLength.length = 0;
      return { value: true, dataChatNew };
    }
  }
};

const keluarRoom = async (data) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: data.idroom });

  if (cekRoom) {
    let sisaAnggota = cekRoom.anggota.filter((el) => el.iduser !== data.iduser);

    let result = await ChatsSaika.findOneAndUpdate(
      { idroom: data.idroom },
      {
        $set: {
          anggota: [...sisaAnggota],
        },
      }
    );

    if (result.anggota.length === 0) {
      console.log("resul anggota 0 nih essss");
      let resultRoom = await ChatsSaika.deleteOne({ idroom: data.idroom });
      if (resultRoom) {
        return { value: true, dataNew: null };
      }
    } else {
      console.log("ga kehapus nih esssss ", result.anggota.length);
      if (data.iduser.includes("anonymous") && result.anggota.length === 1) {
        let resultRoom = await ChatsSaika.deleteOne({ idroom: data.idroom });
        if (resultRoom) {
          return { value: true, dataNew: null };
        }
      } else {
        const resultNew = await ChatsSaika.findOne({ idroom: data.idroom });
        return { value: true, dataNew: resultNew };
      }
    }
  }
};

const notifKeluar = async (data) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: data.idroom });

  let cekUser;
  if (!data.iduser.includes("anonymous")) {
    cekUser = await UserTestSaika.findOne({ _id: data.iduser });
  }
  if (cekRoom) {
    const formatDate = returnFormatDate();
    let dataKirim = {
      iduser: data.iduser,
      kondisi: "keluar",
      namauser: data.nama ? data.nama : !data.iduser.includes("anonymous") ? cekUser.nama : data.iduser,
      tanggal: formatDate.tanggalKirim,
    };
    // if (cekRoom.chats[0].kondisi !== dataKirim.kondisi && cekRoom.chats[0].namauser !== dataKirim.namauser) {
    console.log(dataKirim);
    let result = await ChatsSaika.findOneAndUpdate(
      { idroom: data.idroom },
      {
        $set: {
          chats: [dataKirim, ...cekRoom.chats],
        },
      }
    );
    if (result) {
      const dataChatNew = await ChatsSaika.findOne({ idroom: data.idroom });
      return { value: true, dataChatNew };
    }
    // } else {
    //   console.log("ohhh kesini");
    // }
  }
};

const notifMasuk = async (data) => {
  const cekRoom = await ChatsSaika.findOne({ idroom: data.idroom });

  if (cekRoom) {
    // let dataCheck = false;
    // for (cekRoom.chats of chat){

    //     if(data.iduser === chat.iduser && chat.kondisi === "masuk"){
    //       dataCheck = true
    //     }
    // }
    // let dataChats = cekRoom.chats.map((el) => {
    //   if (el.kondisi === "masuk") {
    //     return el.iduser;
    //   }
    // });
    // if (!dataChats.includes(data.iduser)) {/

    if (cekRoom.chats.length > 0 ? (cekRoom.chats[0].kondisi === "masuk" ? cekRoom.chats[0].iduser !== data.iduser : true) : true) {
      const formatDate = returnFormatDate();
      let dataKirim = {
        iduser: data.iduser,
        kondisi: "masuk",
        namauser: data.namauser,
        tanggal: formatDate.tanggalKirim,
      };
      let result = await ChatsSaika.findOneAndUpdate(
        { idroom: data.idroom },
        {
          $set: {
            chats: [dataKirim, ...cekRoom.chats],
          },
        }
      );
      if (result) {
        const dataChatNew = await ChatsSaika.findOne({ idroom: data.idroom });
        let cekNewMember = cekRoom.chats.map((el) => el.iduser);
        if (!cekNewMember.includes(data.iduser)) {
          return { value: true, dataChatNew, isNew: true };
        } else {
          return { value: true, dataChatNew, isNew: false };
        }
      }
    }
  }
};

const hapusRoom = (req, res) => {
  ChatsSaika.deleteOne({ idroom: req.params.idroom }).then((result) => {
    res.send(result);
  });
};

module.exports = { buatRoom, addPesan, hapusRoom, getRoom, keluarRoom, notifKeluar, notifMasuk, joinRoom };
