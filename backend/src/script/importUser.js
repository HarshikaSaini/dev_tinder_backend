const dotenv = require("dotenv");
dotenv.config();
const fs = require("fs");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user-model");  // Your Mongoose model

(async () => {
  try {
    await mongoose.connect(process.env.URL);

    const raw = fs.readFileSync("./src/script/user.json");
    let users = JSON.parse(raw);
    const processedUsers = [];

    for (let user of users) {
      // Check if email already exists
      const exists = await User.findOne({ email: user.email });
      if (exists) {
        console.log(`⚠ Skipped duplicate email: ${user.email}`);
        continue;
      }

      // Hash password
      const hashed = await bcrypt.hash(user.password, 10);

      processedUsers.push({
        ...user,
        password: hashed
      });
    }

    if (processedUsers.length > 0) {
      await User.insertMany(processedUsers);
      console.log("✅ Users imported successfully!");
    } else {
      console.log("⚠ No users to insert.");
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();