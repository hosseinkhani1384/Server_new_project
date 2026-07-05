const { model, Schema, models } = require("mongoose");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);
const User = models.User || model("User", userSchema);
module.exports = User;
