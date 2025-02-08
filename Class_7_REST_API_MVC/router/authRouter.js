const express = require('express');
const authRouter = express.Router();

const { loginHandler, signupHandler, protectRouteMiddleware, getProfileHandler, logOutHandler } = require("../controller/authController");

authRouter
  .post("/login", loginHandler)
  .post("/signup", signupHandler)
  .get("/profile", protectRouteMiddleware, getProfileHandler)
  .get("/logout", logOutHandler);
  
module.exports = authRouter;