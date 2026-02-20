import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orgName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [serverError, setServerError] = useState(""); // New state for API errors

  // Validation Logic
  const validateField = (name, value) => {
    let error = "";
    const trimmedValue = value.trim();

    switch (name) {
      case "orgName":
        if (trimmedValue.length < 3)
          error = "Organisation name must be at least 3 characters";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue))
          error = "Please enter a valid Gmail/Email";
        break;
      case "password":
        if (trimmedValue.length < 6)
          error = "Password must be at least 6 characters";
        break;
      case "confirmPassword":
        if (trimmedValue !== formData.password.trim())
          error = "Passwords do not match";
        break;
      case "phone":
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(trimmedValue))
          error = "Phone number must be exactly 10 digits";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const isFormValid =
    formData.orgName.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
    formData.password.trim().length >= 6 &&
    formData.confirmPassword.trim() === formData.password.trim() &&
    /^[0-9]{10}$/.test(formData.phone.trim()) &&
    Object.values(errors).every((x) => x === "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setServerError(""); // Clear previous errors

    try {
      // 1. Make the API Call
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.orgName, // Mapping orgName to backend 'name'
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Success!
        console.log("Registration Success:", data);

        // Save user info to local storage (Auto-login)
        localStorage.setItem("userInfo", JSON.stringify(data));

        setSuccessMsg("Account created successfully! Redirecting...");

        // Redirect to Dashboard (skip login page since we have token)
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        // 3. Error from Backend (e.g., "User already exists")
        setServerError(data.message || "Registration failed");
      }
    } catch (error) {
      setServerError("Network error. Is the server running?");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-circle">IS</div>
        <h1 className="brand-name">InnoSphere</h1>
        <h2
          className="welcome-text"
          style={{ color: "#3a8d79", fontSize: "1.2rem" }}
        >
          Create New Account
        </h2>
        <p className="sub-text">Register your organisation to get started</p>

        {/* Success Message */}
        {successMsg && <div className="alert success">{successMsg}</div>}

        {/* API Error Message */}
        {serverError && (
          <div
            className="alert error"
            style={{ color: "red", textAlign: "center", marginBottom: "10px" }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Organisation Name */}
          <div className="form-group">
            <label htmlFor="orgName">Organisation Name</label>
            <input
              id="orgName"
              name="orgName"
              type="text"
              placeholder="Enter organisation name"
              value={formData.orgName}
              onChange={handleChange}
              className={errors.orgName ? "error" : ""}
              disabled={isLoading}
            />
            {errors.orgName && (
              <span className="error-msg">{errors.orgName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Organisation Gmail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="org@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              disabled={isLoading}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "error" : ""}
              disabled={isLoading}
            />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper" style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "25%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-msg">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Re-enter Password</label>
            <div className="password-wrapper" style={{ position: "relative" }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onPaste={(e) => e.preventDefault()}
                className={errors.confirmPassword ? "error" : ""}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "25%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-msg">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Registering..." : "Register Now →"}
          </button>
        </form>

        <div className="footer-links">
          <p style={{ marginTop: "15px", color: "#666" }}>
            Already have an account?{" "}
            <Link to="/" className="link-green">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
