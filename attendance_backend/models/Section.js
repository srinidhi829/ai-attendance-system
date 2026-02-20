const mongoose = require("mongoose");
const sectionSchema = new mongoose.Schema({
  sectionName: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
});
module.exports = mongoose.model("Section", sectionSchema);
