const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
async function Register(req, res) {
  try {
    const userdata = req.body;
    const findUser = await User.findOne({ email: userdata.email });
    if (findUser) {
      return res.status(400).json({
        error: "You have already register",
      });
    }
    const hashPassword = await bcrypt.hash(userdata.password, 10);
    const newUser = await User.create({
      password: hashPassword,
      username: userdata.username,
      email: userdata.email,
    });
    const token = jwt.sign(
      { userid: newUser._id, username: newUser.username, email: newUser.email },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "",
      user: {
        userid: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).send({ error });
  }
}
async function Login(req, res) {
  try {
    const userdata = req.body;
    const findUser = await User.findOne({ email: userdata.email });
    if (!findUser) {
      return res.status(404).json({
        error: "there is no user with this email",
      });
    }
    const isPasswordValid = await bcrypt.compare(
      userdata.password,
      findUser.password,
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "password is incorrect",
      });
    }
    const token = jwt.sign(
      {
        userid: findUser._id,
        username: findUser.username,
        email: findUser.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "",
      user: {
        userid: findUser._id,
        username: findUser.username,
        email: findUser.email,
      },
    });
  } catch (error) {
    res.status(500).send({ error });
  }
}
async function checkAuth(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: "احراز هویت نشدی",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (jwtError) {
      return res.status(401).json({
        error: "توکن نامعتبر یا منقضی شده",
      });
    }

    const user = await User.findById(decoded.userid).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "کاربر یافت نشد",
      });
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ خطا در checkAuth:", error.message);
    res.status(500).json({
      error: "خطا در سرور",
    });
  }
}
async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      message: "با موفقیت خارج شدید",
    });
  } catch (error) {
    res.status(500).json({
      error: "خطا در خروج",
    });
  }
}
module.exports = { Register, Login, checkAuth , logout};
