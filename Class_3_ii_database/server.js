const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path:"./Class_3_ii_database/.env"})    // if in same dir

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xpchg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("Connection to server");

mongoose
  .connect(dbLink)
  .then(function (connection) {
    console.log("Connected to the database successfully.", connection);
  })
  .catch((err) => console.log("Error connecting to the database:", err));
