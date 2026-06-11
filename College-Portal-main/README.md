# College Management System (MERN)

Full-stack College Management System built with React (CRA) + Node/Express + MongoDB. Includes role-based portals (Admin/Faculty/Student/Alumni), academic management, media uploads, and real-time chat via Socket.io.

## Features

**Admin**
- Manage branches, subjects, notices, timetables, materials
- Manage student/faculty/admin profiles and credentials
- Societies management (society details, coordinator assignment, events/projects/achievements)

**Faculty**
- Upload & manage study materials
- Student finder + profile viewing
- Timetable/notice access

**Student**
- View materials, timetable, notices
- Lost & Found (with image upload)
- Browse societies + subscribe

**Alumni**
- Alumni module + Student ↔ Alumni real-time chat (Socket.io)

## Tech Stack

- Frontend: React (Create React App), Redux, Tailwind
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas / MongoDB
- Auth: JWT (cookie-based)
- Realtime: Socket.io
- Uploads/Email (optional): Cloudinary, Nodemailer, SendGrid

## Project Structure

```
College/
	backend/   (Express API + Socket.io)
	frontend/  (React app)
```

## Local Development

### 1) Install dependencies

```bash
cd College/backend
npm install

cd ../frontend
npm install
```

### 2) Backend environment variables

Create `College/backend/.env` (IMPORTANT: no spaces around `=`):

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/college
JWT_SECRET=change_me
FRONTEND_API_LINK=http://localhost:3000

# Optional (emails)
NODEMAILER_EMAIL=
NODEMAILER_PASS=

# Optional (Lost & Found image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional (claim notifications)
SENDGRID_API_KEY=
SENDGRID_FROM=
```

Note: The Mongo connection file lives in `backend/Database/db.js` (capital “D”). This matters on Linux (Render).

### 3) Frontend environment variables

Create `College/frontend/.env`:

```dotenv
REACT_APP_APILINK=http://localhost:4000/api
REACT_APP_MEDIA_LINK=http://localhost:4000/media
```

### 4) Run

```bash
cd College/backend
npm run dev

cd ../frontend
npm start
```

### (Optional) Seed default admin

```bash
cd College/backend
npm run seed
```

Default credentials:
- Email: `admin@gmail.com`
- Password: `admin123`

## Deployment

### Backend: Render (recommended)

Socket.io requires a long-running server, so deploy the backend on Render.

Render settings:
- Root directory: `College/backend`
- Build command: `npm install`
- Start command: `npm start`

Render environment variables:
- `NODE_ENV=production`
- `MONGODB_URI=...` (MongoDB Atlas URI)
- `JWT_SECRET=...`
- `FRONTEND_API_LINK=https://<your-vercel-app>.vercel.app,https://*.vercel.app`
- Add optional email/cloudinary/sendgrid vars if you use those features

MongoDB Atlas note: allow Render to connect (Atlas → Network Access). For quick testing, you can allow `0.0.0.0/0`.

### Frontend: Vercel

Vercel settings:
- Root directory: `College/frontend`
- Build command: `npm run build`
- Output directory: `build`

Vercel environment variables:
- `REACT_APP_APILINK=https://<your-render-backend>.onrender.com/api`
- `REACT_APP_MEDIA_LINK=https://<your-render-backend>.onrender.com/media`

SPA routing is handled via `frontend/vercel.json`.

## Security

- Do not commit `.env` files.
- Rotate any credentials if they were ever shared publicly.

## License

MIT (see [LICENSE](LICENSE)).
