const mongoose = require("mongoose");
const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // This will be hashed
  },
  { timestamps: true },
);
module.exports = mongoose.model("School", schoolSchema);
