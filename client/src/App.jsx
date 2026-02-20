import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./Dashboard.jsx";
import NewClassRegistration from "./NewClassRegistration.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route redirects to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* This route matches the navigate("/new-registration") in Dashboard */}
        <Route path="/new-registration" element={<NewClassRegistration />} />
      </Routes>
    </Router>
  );
}

export default App;
