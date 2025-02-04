const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const util = require("util");
const promisify = util.promisify;

const promisdiedJWTsign = promisify(jwt.sign);
const promisdiedJWTverify = promisify(jwt.verify);

app.use(cookieParser());

/**************************Connection************************/
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./Class_4_ORM_CRUD_SCHEMA/.env" }); 

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xpchg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("Connection to server");

mongoose
  .connect(dbLink) 
  .then(function (connection) {
    console.log("Connected to the database successfully.");
  })
  .catch((err) => console.log("Error connecting to the database:", err));



const schemaRules = {
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email should be unique"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [6, "password should be atleast of 6 length"],
  },
  confirmPassword: {
    type: String,
    required: true,
    minLength: 6,
    // custom validation
    validate: [
      function () {
        return this.password == this.confirmPassword;
      },
      "password should be equal to confirm password",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    // these are the only possible values for the role
    enum: ["user", "admin", "feed curator", "moderator"],
    default: "user",
  },
};
const userSchema = new mongoose.Schema(schemaRules);
/*****************hooks in mongodb************/
// pre save hook
userSchema.pre("save", function (next) {
    console.log("Pre save was called");
    this.confirmPassword = undefined;
    next();
})
// post save hook
userSchema.post("save", function() {
    console.log("Post save was called");
    this.password = undefined; 
    this.__v = undefined;
    })
const UserModel = mongoose.model("User", userSchema);

const SECRET_KEY = "abraacdbrachhumantar";
// token creation:

const tokenCreation = async (req, res, _id) => {
  try {
      //token create
  const authToken = await promisdiedJWTsign(
    { id },
    SECRET_KEY
  );
  // token -> cookie
  res.cookie("jwt", authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 100,
    httpOnly: true, // it can only be accessed by the server
  });
  //res send
  return res.status(200).json({
    message: "Logged In,JWT token created",
  });
  } catch (err) {
    console.error("JWT Signing Error:", err);
  }

};

// token verification
const tokenVerificaton = async function (req, res) {
    try {
        if (req.cookies && req.cookies.jwt) {
        const authToken = req.cookies.jwt;
        const unlockToken = await promisdiedJWTverify(authToken, SECRET_KEY);
        return unlockToken;

        }
        else {
            res.status(400).json({
            message: "No JWT token found",
            })
        }
    } catch (err) {
        res.status(401).json({
          message: "Invalid JWT token",
          error: err,
        });
    }

};


//sign up
const signupHandler = async function (req, res) {
  try {
    const userObject = req.body;
    const user = await UserModel.create(userObject);
    await tokenCreation(req, res,user._id);
  } catch (err) {
    return res.status(500).json({
      message: "something went wrong on our end",
      error: err,
    });
  }
};

//login 
const loginHandler = async function (req, res) {
  try {
    const { email, password } = req.body; // Get email from request body

    if (!email) {
      return res.status(400).json({ message: "Email is required for login" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required for login" });
    }
    
    // Find the user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
          message: "User not found. Please sign up first.",
        });
    }
    let isMatch = false;
    // Check if password matches
    if (user.password === password) {
      isMatch = true;
    }
    if(!isMatch) {
      return res.status(400).json({
        message: "Incorrect password. Please try again.",
      });
    }


    uid = user._id;
    if (req.cookies && req.cookies.jwt) {
        return res.status(200).json({
          message: "Logged In,No JWT token creation required",
        });
    }
    await tokenCreation(req, res, uid);
      
      
  } catch (err) {
    return res.status(500).json({
      message: "something went wrong on our end",
      error: err,
    });
  }
};

//protected route
const protectedRoute = async (req, res, next) => {
    try {
        if (req.cookies && req.cookies.jwt) {
            const payload = await tokenVerificaton(req, res);
            req.id = payload.payload.id;
            next();
        } else {
            res.status(401).json({
                message: "Kindly Go to login",
            })
        }
      
    } catch (err) {
        res.status(500).json({
            message: "something went wrong on our end",
            error: err,
        });
    }
};

//get profile
const getUser = async (req, res) => { 
    try {
    const id = req.id;
    const user = await UserModel.findById(id);
    if (user) {
      res.status(200).json({
        message: user,
      });
    }
    else {
      res.status(404).json({
        message: "user not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "something went wrong on our end",
      error: err.message,
    });
  }
};


app.use(express.json());
app.post("/login",loginHandler);
app.post("/signup", signupHandler);
app.use(protectedRoute);
app.get("/profile",getUser);

const port = 3000;
app.listen(port, function () {
  console.log(`server is running at ${port} port.............`);
});




