const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  photoUrl: { type: String, required: true }, // This remains your "Front/Default" photo

  // --- ADD THESE TWO NEW FIELDS ---
  leftImageUrl: { type: String },
  rightImageUrl: { type: String },

  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
});

module.exports = mongoose.model("Student", studentSchema);
