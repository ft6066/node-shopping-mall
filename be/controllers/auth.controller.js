const User = require("../models/User");
const bcrypt = require("bcryptjs");

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMath = await bcrypt.compare(password, user.password);
      if (isMath) {
        // token
        const token = await user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("이메일 또는 패스워드가 틀렸습니다.");
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = authController;
