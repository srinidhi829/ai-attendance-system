const School = require("../models/School");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register a new school
// @route   POST /api/auth/register
exports.registerSchool = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if school already exists
    const schoolExists = await School.findOne({ email });
    if (schoolExists) {
      return res.status(400).json({ message: "School already exists" });
    }

    // 2. Hash the password (security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the school
    const school = await School.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Send back a success message with the School ID
    if (school) {
      res.status(201).json({
        _id: school.id,
        name: school.name,
        email: school.email,
        token: generateToken(school._id),
      });
    } else {
      res.status(400).json({ message: "Invalid school data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login school
// @route   POST /api/auth/login
exports.loginSchool = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for school email
    const school = await School.findOne({ email });

    // 2. Check password matches
    if (school && (await bcrypt.compare(password, school.password))) {
      res.json({
        _id: school.id,
        name: school.name,
        email: school.email,
        token: generateToken(school._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
