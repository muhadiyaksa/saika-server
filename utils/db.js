const mongoose = require("mongoose");

const url = `mongodb+srv://tongkrongin:tongkrongin2022@tongkrongin.i1nix.mongodb.net/tongkrongin?retryWrites=true&w=majority&ssl=true`;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
