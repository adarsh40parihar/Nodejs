const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
/***********************************UserModel*********************************/

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
    select: false, // This prevents password from being returned in queries by default
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
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
};
const userSchema = new mongoose.Schema(schemaRules);

// Method to check if password is correct
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/*****************hooks in mongodb************/
// pre save hook
userSchema.pre("save",async function (next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Remove confirmPassword field
    this.confirmPassword = undefined;
    next();
  } catch (error) {
    next(error);
  }
})
// post save hook
userSchema.post("save", function() {
    // console.log("Post save was called");
    this.password = undefined; 
    this.__v = undefined;
})
// final touch point
const UserModel = mongoose.model("User", userSchema);

//default export
module.exports = UserModel;
