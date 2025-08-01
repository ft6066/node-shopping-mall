const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 존재하는 유저입니다.");
    }
    const salt = bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      password,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();

    return res.status(200).json({ status: "성공" });
  } catch (error) {
    res.status(400).json({ status: "실패", error: error.message });
  }
};

module.exports = userController;
