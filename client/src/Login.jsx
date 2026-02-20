import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success: Save token and redirect
        console.log("Login Success:", data);
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        // Error: Show message (e.g., "Invalid email or password")
        setErrorMsg(data.message || "Login failed");
      }
    } catch (error) {
      setErrorMsg("Unable to connect to server");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-circle">IS</div>
        <h1 className="brand-name">InnoSphere</h1>
        <p className="sub-text">Welcome Back! Please enter your details.</p>

        {/* Error Display */}
        {errorMsg && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              textAlign: "center",
              fontSize: "0.9rem",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. name@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="footer-links">
          <p style={{ marginTop: "15px", color: "#666" }}>
            Don't have an account?{" "}
            <Link to="/register" className="link-green">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
