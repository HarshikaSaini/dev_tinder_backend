const mongooes = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const userSchema = new mongooes.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      minLength: 3,
      maxLength: 60,
    },
    lastName: {
      type: String,
      lowercase: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    email: {
      type: String,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email id");
        }
      },
    },
    password: {
      type: String,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please Enter Strong Password");
        }
      },
    },
    gender:{
      type:String,
      enum: ["male", "female", "others"],
      default:"male"
    },
    contact: {
      type: Number,
    },
    skills: {
      type: [String],
    },
    photoUrl: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid image url");
        }
      },
    },
    desc:{
      type:String,
      default:"No description avaliable"
    }
  },
  { timestamps: true }
);

userSchema.methods.validatePassword = async function (userInputPassword) {
 const user = this;
 const hashedPassword = user.password;
  const isValidPass = await bcrypt.compare(userInputPassword, hashedPassword);
  return isValidPass;
};

userSchema.methods.getJwt = async function() {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn:"1d" })
  return token;
}

const User = mongooes.model("User", userSchema);
module.exports = User;
