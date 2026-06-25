# 🎓 College Portal Management System

A full-stack College Portal Management System built using the MERN Stack (MongoDB, Express.js, React.js, Node.js). The platform provides a centralized solution for managing students, faculty, administrators, academic resources, notices, societies, alumni interactions, and real-time communication.

---

## 🚀 Features

### 👨‍💼 Admin Portal
- Manage Students, Faculty, and Admin accounts
- Create and manage branches & subjects
- Upload notices and announcements
- Manage timetables and academic schedules
- Handle study materials
- Manage college societies and coordinators
- Monitor portal activities

### 👨‍🏫 Faculty Portal
- Upload and manage study materials
- View student information
- Access timetables and notices
- Manage academic resources

### 👨‍🎓 Student Portal
- View study materials
- Access notices and timetables
- Participate in societies
- Lost & Found management system
- View academic information

### 🎓 Alumni Portal
- Alumni registration and profile management
- Connect with current students
- Real-time messaging system
- Alumni networking opportunities

### 💬 Real-Time Communication
- Student ↔ Alumni Chat
- Socket.IO based messaging
- Instant message delivery

### 🏛 Society Management
- Society information management
- Coordinator assignment
- Event management
- Projects and achievements showcase

---

## 🛠 Tech Stack

### Frontend
- React.js
- Redux
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- JWT Authentication
- Socket.IO
- Multer

### Database
- MongoDB
- Mongoose ODM

### Cloud & Third-Party Services
- Cloudinary (Image Uploads)
- Nodemailer (Email Services)
- SendGrid (Email Notifications)

---

## 📂 Project Structure

```text
College-Portal/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── Database/
│   ├── media/
│   └── index.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── Redux/
│   │   ├── Services/
│   │   └── App.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/College-Portal.git
cd College-Portal
```

---

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend `.env`

Create a `.env` file inside the backend folder:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/college

JWT_SECRET=your_jwt_secret

FRONTEND_API_LINK=http://localhost:3000

NODEMAILER_EMAIL=your_email
NODEMAILER_PASS=your_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM=your_email
```

---

### Frontend `.env`

Create a `.env` file inside the frontend folder:

```env
REACT_APP_APILINK=http://localhost:4000/api
REACT_APP_MEDIA_LINK=http://localhost:4000
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

---

### Start Frontend Server

```bash
cd frontend
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

## 🔐 Authentication

The system uses:

- JWT Authentication
- Cookie-Based Sessions
- Protected Routes
- Role-Based Access Control (RBAC)

Supported Roles:

- Admin
- Faculty
- Student
- Alumni
- Society Coordinator

---

## 📸 Key Modules

- User Management
- Notice Board
- Timetable Management
- Study Material Repository
- Lost & Found System
- Alumni Network
- Real-Time Chat
- Society Management
- Academic Records

---

## 🌟 Future Enhancements

- Attendance Management
- Online Examination System
- Placement Portal
- AI Academic Assistant
- Mobile Application
- Analytics Dashboard

---

## 👨‍💻 Author

Developed as a MERN Stack College Management & Collaboration Platform.

---

## 📄 License

This project is licensed under the MIT License.
