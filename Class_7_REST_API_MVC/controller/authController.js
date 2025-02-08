//UserModel
const UserModel = require("../model/userModel");
// JWT creation and verification
const { tokenCreation, tokenVerificaton } = require("../jwt_creation_verfication");

//sign up
const signupHandler = async function (req, res) {
  try {
        const userObject = req.body;
        // 1. user -> data get, check email, password
        if (!userObject.email || !userObject.password || !userObject.name) {
        return res.status(400).json({
            message: "required data missing",
            status: "failure",
        });
        }
        // 2. email se check -> if exist ->already loggedIn
        const user = await UserModel.findOne({ email: userObject.email });
        if (user) {
            return res.status(400).json({
            message: "user is already exist",
            status: "failure",
            });
        }
        const newUser = await UserModel.create(userObject);
        await tokenCreation(req, res, newUser["_id"]);
        res.status(201).json({
        message: "user signup successfully and JWT also created",
        user: newUser._id,
        status: "Created",
        }); 
      
    }catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure",
        });
    }
};

//login
const loginHandler = async function (req, res) {
  try {
    const { email, password } = req.body; // Get email from request body

    // Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
        status: "failure",
      });
    }
    // Check if password matches
    let areEqual = user.password === password;
    if (!areEqual) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failure",
      });
    }
    id = user["_id"];
    if (req.cookies && req.cookies.jwt) {
      return res.status(200).json({
        message: "Logged In, No JWT token creation required",
        status: "success",
        user: user,
      });
    }
    // generate token
    await tokenCreation(req, res, id);
    res.status(200).json({
      message: "Logged In and JWT token created successfully",
      status: "success",
      user: user,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};

//protected route
const protectRouteMiddleware = async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.jwt) {
      const decryptedToken = await tokenVerificaton(req, res);
      req.id = decryptedToken.id;
      next();
    } else {
      return res.status(401).json({
        message: "unauthorized access",
        status: "failure",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};

//get profile
const getProfileHandler = async (req, res) => {
  try {
    const id = req.id;
    const user = await UserModel.findById(id);
    if (!user) {
    return res.status(404).json({
        message: "user not found",
        status: "failure",
    });
    }
    res.status(200).json({
        message: "profile worked",
        status: "success",
        user: user,
    });
  } catch (err) {
        res.status(500).json({
            message: err.message,
            status:"failure"
        })

  }
};

//logout
const logOutHandler = async (req, res) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.status(200).json({
      message: "Logged Out successfully",
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};
const isAdminMiddleWare = async function (req, res, next) {
  const id = req.id;
  const user = await UserModel.findById(id);
  if (user.role !== "admin") {
    return res.status(403).json({
      message: "you are not admin",
      status: "failure",
    });
  } else {
    next();
  }
}

module.exports = {
  signupHandler: signupHandler,
  loginHandler: loginHandler,
  protectRouteMiddleware: protectRouteMiddleware,
  getProfileHandler: getProfileHandler,
  logOutHandler: logOutHandler,
  isAdminMiddleWare: isAdminMiddleWare,
};
