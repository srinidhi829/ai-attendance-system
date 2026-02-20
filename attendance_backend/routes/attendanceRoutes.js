const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Section = require("../models/Section");
const supabase = require("../config/supabase");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/process", upload.single("group_image"), async (req, res) => {
  try {
    const { class: className, section, date, period } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // 🔹 Send to ML
    const formData = new FormData();
    formData.append("group_image", req.file.buffer, req.file.originalname);
    formData.append("date", date);

    const mlResponse = await axios.post(
      "http://localhost:5001/process-attendance",
      formData,
      { headers: formData.getHeaders() },
    );

    const { presentStudents, processedImage } = mlResponse.data;

    console.log("ML response received");

    // 🔹 Upload image to Supabase
    const buffer = Buffer.from(processedImage, "base64");
    const fileName = `attendance_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("attendance-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
      });

    if (uploadError) throw new Error("Supabase upload failed");

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("attendance-images")
        .createSignedUrl(fileName, 60 * 60);

    if (signedUrlError) throw new Error("Signed URL generation failed");

    const imageUrl = signedUrlData.signedUrl;

    // 🔹 Find Class
    const classDoc = await Class.findOne({ className });

    if (!classDoc) {
      return res.status(400).json({ error: "Class not found" });
    }

    // 🔹 Find Section
    const sectionDoc = await Section.findOne({
      sectionName: section,
      class: classDoc._id,
    });

    if (!sectionDoc) {
      return res.status(400).json({ error: "Section not found" });
    }

    // 🔹 Get Students
    const students = await Student.find({
      section: sectionDoc._id,
    });

    // 🔹 Convert ML names → register numbers
    const presentRegisterNumbers = students
      .filter((student) => presentStudents.includes(student.studentName))
      .map((student) => student.registrationNumber);

    const absentRegisterNumbers = students
      .filter((student) => !presentStudents.includes(student.studentName))
      .map((student) => student.registrationNumber);

    console.log("Present:", presentRegisterNumbers);
    console.log("Absent:", absentRegisterNumbers);

    // 🔹 Save Attendance (UPDATED HERE)
    const attendance = await Attendance.findOneAndUpdate(
      { class: className, section, date, period },
      {
        class: className,
        section,
        date,
        period,
        presentRegisterNumbers,
        absentRegisterNumbers,
        presentStudentNames: presentStudents,
        processedImageUrl: imageUrl,
      },
      { upsert: true, returnDocument: "after" }, // ✅ Updated
    );

    res.status(200).json({
      message: "Attendance saved successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Final Error:", error);
    res.status(500).json({ error: "Attendance processing failed" });
  }
});

module.exports = router;
