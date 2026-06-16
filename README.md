# AI Attendance System

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## Overview

The AI Attendance System is a full-stack application that automates attendance management using face recognition technology. Instead of manually recording attendance, the system identifies registered students from classroom images and generates attendance records automatically.

The project combines a React frontend, a Node.js backend, and a Python-based machine learning service to provide an efficient and scalable attendance solution.

---

## Features

* Automated attendance marking using face recognition
* Student enrollment and registration
* Attendance record management
* Full-stack architecture with separate frontend, backend, and ML services
* Dataset-based face recognition workflow
* Modular and scalable project structure

---

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML
* CSS

### Backend

* Node.js
* Express.js

### Machine Learning

* Python
* Face Recognition
* NumPy

### Database

* MongoDB

### Version Control

* Git
* GitHub

---

## Project Structure

```text
ai-attendance-system/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── attendance_backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── ML_Service/
│   ├── Attendance_test_dataset/
│   ├── app.py
│   ├── enroll.py
│   └── requirements.txt
│
└── README.md
```

---

## System Architecture

1. Students are enrolled into the system.
2. Face data is processed and stored by the ML service.
3. Classroom images are uploaded for attendance processing.
4. The ML service identifies students using face recognition.
5. Attendance data is sent to the backend.
6. Records are stored and managed through the backend.
7. The frontend displays attendance information to users.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/srinidhi829/ai-attendance-system.git
cd ai-attendance-system
```

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

### Backend Setup

```bash
cd attendance_backend
npm install
node server.js
```

---

### Machine Learning Service Setup

```bash
cd ML_Service
pip install -r requirements.txt
python app.py
```

---

## Future Enhancements

* Real-time attendance tracking
* Live classroom monitoring
* Attendance analytics dashboard
* Mobile application integration
* Enhanced face recognition accuracy
* Cloud deployment support

---

## Author

**Krishna Srinidhi Vasireddy**

BTech CSE (AI & DS)
AI & ML Enthusiast | Full-Stack Developer | Radio Jockey

GitHub: https://github.com/srinidhi829
