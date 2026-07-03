const mongoose = require("mongoose");

const connectdb = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("connect database");
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = connectdb;
