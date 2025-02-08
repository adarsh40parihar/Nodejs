const express = require('express');
const userRouter = express.Router();

const { createUser, getUser, getAllUser, deleteUser, } = require("../controller/userController");
const { protectRouteMiddleware, isAdminMiddleWare } = require('../controller/authController');

userRouter
    .post("/", createUser)
    .get("/:userId", getUser)
    .get("/", protectRouteMiddleware, isAdminMiddleWare, getAllUser)
    .delete("/:userId", protectRouteMiddleware, deleteUser);

module.exports = userRouter;