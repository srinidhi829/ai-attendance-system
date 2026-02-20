const { spawn } = require("child_process");
const path = require("path");
const Class = require("../models/Class");
const Section = require("../models/Section");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// 1. Create or Get Class
exports.createClass = async (req, res) => {
  try {
    const { className, schoolId } = req.body;
    let schoolClass = await Class.findOne({ className, school: schoolId });
    if (!schoolClass) {
      schoolClass = await Class.create({ className, school: schoolId });
    }
    res.status(200).json(schoolClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 2. Create or Get Section
exports.createSection = async (req, res) => {
  try {
    const { sectionName, classId } = req.body;
    let section = await Section.findOne({ sectionName, class: classId });
    if (!section) {
      section = await Section.create({ sectionName, class: classId });
    }
    res.status(200).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Add a Student
exports.addStudent = async (req, res) => {
  try {
    const {
      studentName,
      registrationNumber,
      photoUrl,
      leftImageUrl,
      rightImageUrl,
      sectionId,
    } = req.body;

    const newStudent = await Student.create({
      studentName,
      registrationNumber,
      photoUrl,
      leftImageUrl,
      rightImageUrl,
      section: sectionId,
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. Get Students
exports.getStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const students = await Student.find({ section: sectionId });
    res.json(students);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 5. Mark Manual Attendance (Existing)
exports.markAttendance = async (req, res) => {
  try {
    const { date, period, classId, sectionId, attendanceData } = req.body;
    const formattedDate = new Date(date);
    const existing = await Attendance.findOne({
      section: sectionId,
      date: formattedDate,
      period: period,
    });
    if (existing)
      return res.status(400).json({ message: "Attendance already uploaded." });

    const operations = attendanceData.map((record) => ({
      updateOne: {
        filter: {
          student: record.studentId,
          date: formattedDate,
          period: period,
        },
        update: {
          $set: { status: record.status, class: classId, section: sectionId },
        },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(operations);
    res.status(200).json({ message: "Attendance saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save attendance" });
  }
};

// 6. NEW: Mark AI Attendance (Face Recognition Integration)
exports.markAiAttendance = async (req, res) => {
  try {
    const { classId, sectionId, date, period } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded." });
    }

    const groupPhotoPath = req.file.path;

    // Fetch student names in this section for ML comparison
    const students = await Student.find({ section: sectionId });
    const studentNames = students.map((s) => s.studentName);

    // Spawn Python Process
    const pythonProcess = spawn("python", [
      path.join(__dirname, "../ml/take_attendance.py"),
      groupPhotoPath,
      date,
      JSON.stringify(studentNames),
    ]);

    let pythonData = "";
    let pythonError = "";

    pythonProcess.stdout.on("data", (data) => {
      pythonData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      pythonError += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Python Error:", pythonError);
        return res.status(500).json({ message: "ML Processing failed." });
      }

      try {
        const mlResult = JSON.parse(pythonData);

        // Save AI results to MongoDB Attendance collection
        const newAttendance = await Attendance.create({
          classId: classId,
          sectionId: sectionId,
          date: date,
          period: period,
          presentStudents: mlResult.present,
          absentStudents: mlResult.absent,
          totalFaces: mlResult.total_faces,
          recognizedFaces: mlResult.recognized_faces,
          unknownFaces: mlResult.unknown_faces,
          annotatedImage: mlResult.annotated_image,
        });

        res.status(201).json(newAttendance);
      } catch (parseError) {
        res.status(500).json({ message: "Error parsing ML results." });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student record not found." });
    }
    await Attendance.deleteMany({ student: id });
    res.status(200).json({ message: "Student and data deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting." });
  }
};
