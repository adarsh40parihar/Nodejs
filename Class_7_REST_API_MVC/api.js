const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

/***********************************Connection*********************************/
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./Class_7_REST_API_MVC/.env" }); 

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xpchg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("Connection to server");

mongoose
  .connect(dbLink) 
  .then(function (connection) {
    console.log("Connected to the database successfully.");
  })
  .catch((err) => console.log("Error connecting to the database:", err));


app.use(express.json());

/******************Auth Methods & route****************/
const authRouter = require("./router/authRouter");
app.use("/api/auth",authRouter);

/**************** user routes and their handlers**************/
const userRouter = require("./router/userRouter");
app.use("/api/user", userRouter);

/****************movies and their handlers**************/
const moviesRouter = require("./router/moviesRouter");
app.use("/api/movies", moviesRouter);

const port = 3000;
app.listen(port, function () {
  console.log(`server is running at Port ${port}.`);
});




