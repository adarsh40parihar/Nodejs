//UserModel
const UserModel = require("../Model/UserModel");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// JWT creation and verification
const {
  tokenCreation,
  tokenVerificaton,
} = require("../Utility/JWT_creation_verfication");

//signUp with Welcome message on Mail
const signupHandler = async function (req, res) {
  try {
    const userObject = req.body;
    if (!userObject.email || !userObject.password || !userObject.name) {
      // 1. user -> data get, check email, password
      return res.status(400).json({
        message: "required data missing",
        status: "failure",
      });
    }
    // 2. email se check -> if exist ->already exist
    const user = await UserModel.findOne({ email: userObject.email });
    if (user) {
      return res.status(400).json({
        message: "user is already exist",
        status: "failure",
      });
    }

    // Create new user - password will be hashed by pre-save hook
    const newUser = await UserModel.create(userObject);

    // Create JWT and set cookie
    await tokenCreation(req, res, newUser["_id"]);
    res.status(201).json({
      message:
        "User SignUp successfully and JWT also Created and Welcome Mail Sent successfully",
      user: newUser,
      status: "Created",
    });

    const subject = "Welcome to Jio, Explore new movies and TV shows.";
    const toReplaceObject = { name: newUser.name };
    await emailSender(
      subject,
      "./templates/welcome.html",
      newUser.email,
      toReplaceObject
    );
    console.log("Welcome mail is sent");
  } catch (err) {
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

    // Find the user by email and geeting the password from db for matching.
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "Invalid email or password",
        status: "failure",
      });
    }
    // Check if password matches
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
        status: "failure",
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    id = user["_id"];
    // generate token
    await tokenCreation(req, res, id);

    res.status(200).json({
      message: "Logged In and JWT token created successfully",
      status: "success",
      user: userResponse,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};

//protected route
const protectRouteMiddleware = async function (req, res, next) {
  try {
    let jwttoken = req.cookies.jwt;

    if (!jwttoken) throw new Error("UnAuthorized!");

    let decryptedToken = await tokenVerificaton(jwttoken);

    if (decryptedToken.error) {
      return res.status(decryptedToken.status).json({
        message: decryptedToken.error,
        status: "failure",
      });
    }
    let userId = decryptedToken.id;
    // adding the userId to the req object
    req.userId = userId;
    // console.log("authenticated");
    next();
  } catch (err) {
    return res.status(500).json({
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
      status: "failure",
    });
  }
};

// Sending Email for Otp and signup.
const emailSender = require("../Utility/DynamicEmailSender");
const otpGenerator = function () {
  return Math.floor(100000 + Math.random() * 900000);
};

const forgetPasswordHandler = async (req, res) => {
  try {
    /****
     * 1. user send the email : extract email
     * 2. check if email is present in DB (user)
     * if email is not present -> send a response to the user(user not found)
     * *  if email is present ->
     * 3. create basic otp ->
     *        * user  ke saath token map krdo
     *        *  send to the email
     * 4. url -> reset url -> id
     *
     * ***/
    //1.
    if (req.body.email == undefined) {
      return res.status(401).json({
        status: "failure",
        message: "Please enter the email for forget Password",
      });
    }
    //2.
    const user = await UserModel.findOne({ email: req.body.email });
    if (user == null) {
      return res.status(404).json({
        status: "failure",
        message: "user not found for this email",
      });
    }
    //3.
    const otp = otpGenerator();
    user.otp = otp;
    user.otpExpiry = Date.now() + 1000 * 60 * 10; //10 minutes expiration

    await user.save({ validateBeforeSave: false });
    // 4. Generate a secure token
    // const resetToken = jwt.sign({ userId: user._id, otp: otp }, process.env.JWT_SECRET, { expiresIn: '10m' });

    // // 5. Send the reset URL with the token
    // const resetURL = `http://localhost:3000/api/auth/resetPassword/${resetToken}`;
    const resetURL = `http://localhost:3000/api/auth/resetPassword/${user._id}`;

    res.status(200).json({
      message: "OTP is send successfully",
      status: "success",
      otp: otp,
      resetURL: resetURL,
    });
    const subject = "OTP for Resetting your password";
    const toReplaceObject = { name: user.name, otp: user.otp };
    await emailSender(
      subject,
      "./templates/otp.html",
      user.email,
      toReplaceObject
    );
    console.log("OTP is sent successfully");
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    /**
     * 1. id ,  id
     * 2. if otp , password , confirmPassword are present
     *      *  otp should n't be expires
     *      * otp compare -> if matches
     *      *  password update
     *      *  re-route them to login page
     * ***/
    let resetDetails = req.body;
    if (
      !resetDetails.password ||
      !resetDetails.confirmPassword ||
      !resetDetails.otp ||
      resetDetails.password != resetDetails.confirmPassword
    ) {
      res.status(401).json({
        status: "failure",
        message: "invalid request",
      });
    }
    const userId = req.params.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failure",
        message: "user not found",
      });
    }
    // if otp is not present  in db user
    if (user.otp == undefined) {
      return res.status(401).json({
        status: "failure",
        message: "unauthorized acces to reset Password",
      });
    }

    // if otp is expired
    if (Date.now() > user.otpExpiry) {
      return res.status(401).json({
        status: "failure",
        message: "otp expired",
      });
    }
    // if otp is incorrect
    if (user.otp != resetDetails.otp) {
      return res.status(401).json({
        status: "failure",
        message: "otp is incorrect",
      });
    }
    // update the password and confirm password
    user.password = resetDetails.password;
    user.confirmPassword = resetDetails.confirmPassword;
    // remove the otp from the user
    user.otp = undefined;
    user.otpExpiry = undefined;

    // save the user to the database
    await user.save();
    res.status(200).json({
      status: "success",
      message: "password reset successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: "failure",
    });
  }
};

const logoutHandler = function (req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None", // Change to "Strict" if frontend and backend are on same origin
    path: "/",
  });

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
};

module.exports = {
  signupHandler: signupHandler,
  loginHandler: loginHandler,
  protectRouteMiddleware: protectRouteMiddleware,
  getProfileHandler: getProfileHandler,
  forgetPasswordHandler: forgetPasswordHandler,
  resetPasswordHandler: resetPasswordHandler,
  logoutHandler: logoutHandler,
};
