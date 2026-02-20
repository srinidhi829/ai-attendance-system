import React, { useState } from "react";
// 1. We only need the import from your client file
import { supabase } from "./supabaseClient";
import "./NewClassRegistration.css";

const NewClassRegistration = () => {
  const [filters, setFilters] = useState({ class: "", section: "" });
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [newStudent, setNewStudent] = useState({
    studentName: "",
    registrationNumber: "",
  });

  const [images, setImages] = useState({
    front: null,
    left: null,
    right: null,
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImages({ ...images, [e.target.name]: e.target.files[0] });
  };

  const getRequiredIds = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const classRes = await fetch("http://localhost:5000/api/data/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        className: filters.class,
        schoolId: userInfo?._id,
      }),
    });
    const classData = await classRes.json();

    const sectionRes = await fetch("http://localhost:5000/api/data/section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sectionName: filters.section,
        classId: classData._id,
      }),
    });
    const sectionData = await sectionRes.json();
    return sectionData._id;
  };

  const loadStudents = async () => {
    if (!filters.class || !filters.section) {
      setFeedback({
        type: "error",
        message: "Select Class and Section first.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const sectionId = await getRequiredIds();
      const res = await fetch(
        `http://localhost:5000/api/data/students/${sectionId}`,
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (error) {
      setFeedback({ type: "error", message: "Failed to fetch data." });
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: Secure Upload to Supabase ---
  const uploadToSupabase = async (file, side, regNum) => {
    // We name it by Registration Number so it's organized: "101/front.jpg"
    const fileName = `${regNum}/${side}_${Date.now()}.jpg`;

    // 1. Upload the file
    const { data, error } = await supabase.storage
      .from("student-images") // Match the bucket name we created
      .upload(fileName, file);

    if (error) throw error;

    // 2. Create a SIGNED URL (Private access)
    // This URL lasts for 1 year (31536000 seconds)
    const { data: signedData, error: urlError } = await supabase.storage
      .from("student-images")
      .createSignedUrl(fileName, 31536000);

    if (urlError) throw urlError;
    return signedData.signedUrl;
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    if (!images.front || !images.left || !images.right) {
      alert("Please upload all three required images (Front, Left, Right).");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload images with Registration Number as folder name
      const frontUrl = await uploadToSupabase(
        images.front,
        "front",
        newStudent.registrationNumber,
      );
      const leftUrl = await uploadToSupabase(
        images.left,
        "left",
        newStudent.registrationNumber,
      );
      const rightUrl = await uploadToSupabase(
        images.right,
        "right",
        newStudent.registrationNumber,
      );

      const sectionId = await getRequiredIds();

      // 2. Save to your MongoDB Backend
      const response = await fetch("http://localhost:5000/api/data/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: newStudent.studentName,
          registrationNumber: newStudent.registrationNumber,
          photoUrl: frontUrl, // FRONT is the default
          leftImageUrl: leftUrl,
          rightImageUrl: rightUrl,
          sectionId: sectionId,
        }),
      });

      if (response.ok) {
        setFeedback({
          type: "success",
          message: "Student Registered Successfully!",
        });
        setNewStudent({ studentName: "", registrationNumber: "" });
        setImages({ front: null, left: null, right: null });
        setIsModalOpen(false);
        loadStudents();
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Error: " + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student permanently?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/data/student/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents(students.filter((s) => s._id !== id));
        setFeedback({ type: "success", message: "Deleted successfully." });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Delete failed." });
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h2 className="title">Student Management</h2>

        <div className="action-bar">
          <div className="selectors">
            <select
              name="class"
              onChange={handleFilterChange}
              value={filters.class}
            >
              <option value="">Select Class</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={`Class ${i + 1}`}>
                  Class {i + 1}
                </option>
              ))}
            </select>
            <select
              name="section"
              onChange={handleFilterChange}
              value={filters.section}
            >
              <option value="">Select Section</option>
              {["A", "B", "C", "D"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            <button
              className="btn-load"
              onClick={loadStudents}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load Students"}
            </button>
            <button className="btn-add" onClick={() => setIsModalOpen(true)}>
              + Add Student
            </button>
          </div>
        </div>

        {feedback.message && (
          <div className={`status-alert ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Full Name</th>
                <th>Registration No.</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <img
                        src={s.photoUrl}
                        alt="front"
                        className="table-avatar"
                      />
                    </td>
                    <td>{s.studentName}</td>
                    <td>{s.registrationNumber}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(s._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add New Student</h3>
            <form onSubmit={handleAddStudentSubmit}>
              <div className="form-input">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.studentName}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      studentName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-input">
                <label>Registration Number</label>
                <input
                  type="text"
                  required
                  value={newStudent.registrationNumber}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      registrationNumber: e.target.value,
                    })
                  }
                />
              </div>

              <hr className="divider" />
              <p className="image-note">All 3 perspectives are required:</p>

              <div className="form-input">
                <label>1. Front Image (Default View)</label>
                <input
                  type="file"
                  name="front"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-input">
                <label>2. Left Side Image</label>
                <input
                  type="file"
                  name="left"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                />
              </div>

              <div className="form-input">
                <label>3. Right Side Image</label>
                <input
                  type="file"
                  name="right"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                />
              </div>

              <div className="modal-btns">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewClassRegistration;
