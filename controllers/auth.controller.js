const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const toShamsi = (date) => {
  if (!date) return "---";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};
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
      imageUrl: "",
    });
    const avatar = `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${newUser._id}`;
    const fixUserImg = await User.findByIdAndUpdate(
      newUser._id,
      { imageUrl: avatar, Createdtime: toShamsi(newUser.createdAt) },
      { returnDocument: "after" },
    );
    const token = jwt.sign(
      {
        userId: fixUserImg._id,
        username: fixUserImg.username,
        email: fixUserImg.email,
        imageUrl: fixUserImg.imageUrl,
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
    res.status(201).json({
      message: "",
      user: {
        username: fixUserImg.username,
        email: fixUserImg.email,
        imageUrl: fixUserImg.imageUrl,
        dateCreate: fixUserImg.Createdtime,
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
    console.log(req.ip)
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
        userId: findUser._id,
        username: findUser.username,
        email: findUser.email,
        imageUrl: findUser.imageUrl,
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
        username: findUser.username,
        email: findUser.email,
        imageUrl: findUser.imageUrl,
        dateCreate: findUser.Createdtime,
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

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "کاربر یافت نشد",
      });
    }

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        imageUrl: user.imageUrl,
        dateCreate: user.Createdtime,
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
module.exports = { Register, Login, checkAuth, logout };
