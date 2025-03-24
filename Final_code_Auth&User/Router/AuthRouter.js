const express = require('express');
const AuthRouter = express.Router();

const {
  loginHandler,
  signupHandler,
  protectRouteMiddleware,
  getProfileHandler,
  logoutHandler,
  forgetPasswordHandler,
  resetPasswordHandler,
} = require("../Controllers/AuthController");

AuthRouter.post("/login", loginHandler)
  .post("/signup", signupHandler)
  .get("/profile", protectRouteMiddleware, getProfileHandler)
  .get("/logout", logoutHandler)
  .patch("/forgetPassword", forgetPasswordHandler)
  .patch("/resetPassword/:userId", resetPasswordHandler);

module.exports = AuthRouter;