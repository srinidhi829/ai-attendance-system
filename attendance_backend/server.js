require("dotenv").config(); // ✅ MUST BE FIRST LINE

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes AFTER dotenv
const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
