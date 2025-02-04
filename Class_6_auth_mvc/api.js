const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

/***********************************Connection*********************************/
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./Class_6_auth_mvc/.env" }); 

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xpchg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("Connection to server");

mongoose
  .connect(dbLink) 
  .then(function (connection) {
    console.log("Connected to the database successfully.");
  })
  .catch((err) => console.log("Error connecting to the database:", err));



//handler function -> users
const {  createUser, getUser,getAllUser,deleteUser,} = require("./userControllers");


/*********Auth Methods & route****************/
const {loginHandler,signupHandler,protectRouteMiddleware,getProfileHandler,logOutHandler,isAdminMiddleWare} = require("./auth_methods_and_route")

app.use(express.json());
app.post("/login",loginHandler);
app.post("/signup", signupHandler);
app.get("/profile",protectRouteMiddleware, getProfileHandler);
app.get("/logout", logOutHandler);

/****************routes and their handlers**************/

app.post("/user", createUser);
app.get("/user/:userId", getUser);
app.get("/user/", protectRouteMiddleware, isAdminMiddleWare, getAllUser);
app.delete("/user/:userId", protectRouteMiddleware, deleteUser);

const port = 3000;
app.listen(port, function () {
  console.log(`server is running at Port ${port}.`);
});




