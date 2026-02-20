const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createClass,
  createSection,
  addStudent,
  getStudentsBySection,
  markAttendance,
  markAiAttendance, // <--- New AI function
  deleteStudent,
} = require("../controllers/dataController");

// --- MULTER CONFIGURATION FOR AI GROUP PHOTOS ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/attendance_groups/"); // Folder for temporary raw group photos
  },
  filename: (req, file, cb) => {
    cb(null, `group_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// --- EXISTING ROUTES ---
router.post("/class", createClass);
router.post("/section", createSection);
router.post("/student", addStudent);
router.get("/students/:sectionId", getStudentsBySection);
router.post("/attendance", markAttendance);
router.delete("/student/:id", deleteStudent);

// --- NEW AI ATTENDANCE ROUTE ---
// Uses 'upload.single("groupPhoto")' to catch the image file from the frontend
router.post(
  "/mark-ai-attendance",
  upload.single("groupPhoto"),
  markAiAttendance,
);

module.exports = router;
