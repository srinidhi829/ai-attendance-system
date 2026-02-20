const express = require("express");
const router = express.Router();
const {
  registerSchool,
  loginSchool,
} = require("../controllers/authController");

// The actual URL will be /api/auth/register
router.post("/register", registerSchool);

// The actual URL will be /api/auth/login
router.post("/login", loginSchool);

module.exports = router;
