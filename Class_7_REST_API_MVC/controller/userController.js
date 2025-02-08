const UserModel = require("../model/userModel");
/********************handler function -> users*********************************/

const createUser = async function (req, res) {
  try {
    const userObject = req.body;
    const user = await UserModel.create(userObject);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
      error: err,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const id = req.params.userId;
    const user = await UserModel.findById(id);
    if (user) {
      res.status(200).json({
        message: user,
      });
    } else {
      res.status(404).json({
        message: "user not found",
        message: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const user = await UserModel.find();
    // if user is present -> send the resp
    if (user.length != 0) {
      res.status(200).json({
        message: user,
      });
    } else {
      res.status(404).json({
        message: "did not found any user",
        message: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.userId;
    const user = await UserModel.findByIdAndDelete(id);
    if (user) {
      res.status(200).json({
        message: "user deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "user not found",
        message: err.message,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
    });
  }
};

module.exports = {
  createUser: createUser,
  getUser: getUser,
  getAllUser: getAllUser,
  deleteUser: deleteUser,
};
