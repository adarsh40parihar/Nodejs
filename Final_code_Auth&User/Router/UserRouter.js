const express = require('express');
const userRouter = express.Router();

const { createUser, getUser, getAllUser, deleteUser,isAdminMiddleWare } = require("../Controllers/UserController");
const { protectRouteMiddleware } = require("../Controllers/AuthController");

userRouter
  .use(protectRouteMiddleware)
  .post("/", createUser)
  .get("/:userId", getUser)
  .get("/", protectRouteMiddleware, isAdminMiddleWare, getAllUser)
  .delete("/:userId", protectRouteMiddleware, deleteUser);

module.exports = userRouter;