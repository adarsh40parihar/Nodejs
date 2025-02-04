const express = require("express");
const app = express();
 

/**************************Connection************************/
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./Class_4/.env" }); 

const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.xpchg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log("Connection to server");

mongoose
  .connect(dbLink) 
  .then(function (connection) {
    console.log("Connected to the database successfully.");
  })
  .catch((err) => console.log("Error connecting to the database:", err));


 /**************************************************/ 
// user create -> jio cinema -> setOf rules:
  
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

const addUser = async function (req,res) {
    try {
        const userObject = req.body;
        const user = await UserModel.create(userObject);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({
            message: "something went wrong on our end",
            error: err
        });
    }
}

const getUser = async (req,res)=>{
    try {
        const id = req.params.userId;
        const user = await UserModel.findById(id);
        if (user) {
            res.status(200).json({
                message: user
            })
        }
        else {
            res.status(404).json({
                message: "user not found",
                message: err.message
            })
        }
    } catch (err) {
        res.status(500).json({
            message: "something went wrong on our end",
        })
    }
}

const getAllUser = async (req, res) => {
  try {
    const user = await UserModel.find();
    // if user is present -> send the resp
    if (user.length!=0) {
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

app.use(express.json());



const port = 3000;
app.listen(port, function () {
  console.log(`server is running at ${port} port.............`);
});




