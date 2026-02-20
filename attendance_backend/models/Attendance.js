const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },

  // Store register numbers of present students
  presentRegisterNumbers: {
    type: [String],
    required: true,
  },

  // Store register numbers of absent students
  absentRegisterNumbers: {
    type: [String],
    required: true,
  },

  // Optional: store recognized names if needed
  presentStudentNames: {
    type: [String],
  },

  processedImageUrl: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate attendance for same class + section + date + period
attendanceSchema.index(
  { class: 1, section: 1, date: 1, period: 1 },
  { unique: true },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
