const express = require("express");
const authRouter = express.Router();
const {userValidator} = require("../utils/user");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

authRouter.post("/signup", async (req, res) => {
  try {
    const { error } = userValidator(req.body);
    if (error) {
      return res.status(400).json({mess: error});
    }
    const {
      firstName,
      lastName,
      age,
      email,
      contact,
      skills,
      photoUrl,
      password,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const userData = new User({
      firstName,
      lastName,
      age,
      email,
      contact,
      skills,
      photoUrl,
      password: passwordHash,
    });
    await userData.save();
    res.status(200).json({mess:"User Added successfully"});
  } catch (error) {
    if (error.name == "ValidationError") {
      const mess = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: mess });
    }
    res.status(500).send("Internall server error");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({mess:"Invalid Email !"})
    }
    const isValidPassword = await user.validatePassword(password);

    if (isValidPassword) {
      const token = await user.getJwt();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly:true,
        secure:true,
        sameSite:'none',
        path:"/"
      });
      res.status(200).json({mess:"Logged in successfully",data:user});
    } else {
      return res.status(400).json({mess:"Invaild Password !"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .clearCookie("token",{ expires: new Date(Date.now()),httpOnly:true,secure:true,sameSite:"none",path:"/" })
    .status(200)
    .send("User logged out successfully !");
});


module.exports = authRouter;