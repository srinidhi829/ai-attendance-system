const mongoose = require("mongoose");
const classSchema = new mongoose.Schema({
  className: { type: String, required: true },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
});
module.exports = mongoose.model("Class", classSchema);
