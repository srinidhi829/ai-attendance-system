import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [sessionDetails, setSessionDetails] = useState({
    className: "",
    section: "",
    date: new Date().toISOString().split("T")[0],
    period: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlResult, setMlResult] = useState(null);

  const handleInputChange = (e) => {
    setSessionDetails({ ...sessionDetails, [e.target.name]: e.target.value });
  };

  // NEW: Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("userInfo"); // Optional: clear session
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Please upload a classroom photo first.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("group_image", selectedImage);
      formData.append("class", sessionDetails.className);
      formData.append("section", sessionDetails.section);
      formData.append("date", sessionDetails.date);
      formData.append("period", sessionDetails.period);

      const response = await fetch(
        "http://localhost:5000/api/attendance/process",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.data) {
        const attendance = result.data;

        setMlResult({
          present: attendance.presentRegisterNumbers || [],
          absent: attendance.absentRegisterNumbers || [],
          imageUrl: attendance.processedImageUrl || null,
        });
      } else {
        alert(result.error || "Attendance failed");
      }
    } catch (error) {
      alert("Server error occurred");
    }

    setIsProcessing(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* NEW: Navigation Buttons */}
        <div className="nav-header">
          <button 
            className="nav-btn secondary" 
            onClick={() => navigate("/new-registration")}
          >
            + New Class / Entry
          </button>
          <button 
            className="nav-btn logout" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="logo-circle">IS</div>
        <h1 className="brand-name">InnoSphere</h1>
        <p className="sub-text">Attendance Capture & AI Analysis</p>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class</label>
            <select
              name="className"
              value={sessionDetails.className}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Class</option>
              {[...Array(10)].map((_, i) => (
                <option key={i} value={`Class ${i + 1}`}>
                  Class {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Section</label>
            <select
              name="section"
              value={sessionDetails.section}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={sessionDetails.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Period</label>
            <input
              type="number"
              name="period"
              min="1"
              max="8"
              value={sessionDetails.period}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Run Attendance"}
          </button>
        </form>

        {/* RESULTS */}
        {mlResult && (
          <div className="result-section animate-in">
            <hr className="divider" />
            <h2 className="result-title">Attendance Results</h2>

            {/* COUNTS */}
            <div className="stats-row">
              <div className="stat-card present-bg">
                <h3>{mlResult.present.length}</h3>
                <p>Present</p>
              </div>
              <div className="stat-card absent-bg">
                <h3>{mlResult.absent.length}</h3>
                <p>Absent</p>
              </div>
            </div>

            {/* REGISTER LISTS */}
            <div className="list-section">
              <div className="list-container">
                <h4 className="present-text">Present IDs</h4>
                <div className="id-grid">
                  {mlResult.present.map((id, i) => (
                    <span key={i} className="id-badge present-badge">
                      {id}
                    </span>
                  ))}
                </div>
              </div>

              <div className="list-container">
                <h4 className="absent-text">Absent IDs</h4>
                <div className="id-grid">
                  {mlResult.absent.map((id, i) => (
                    <span key={i} className="id-badge absent-badge">
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* IMAGE */}
            {mlResult.imageUrl && (
              <div className="image-section">
                <h4>AI Processed Output</h4>
                <div className="img-frame">
                  <img src={mlResult.imageUrl} alt="AI Result" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;