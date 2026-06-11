require("dotenv").config();

const connectToMongo = require("./Database/db");
const express = require("express");
const app = express();

// Required for correct HTTPS detection behind reverse proxies (Render)
app.set("trust proxy", 1);
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const { getOrCreateConversation, createMessage } = require("./controllers/chat.controller");
const port = process.env.PORT || 4000;
var cors = require("cors");

const parseAllowedOrigins = () => {
  const raw = process.env.FRONTEND_API_LINK || "";
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (list.length > 0) return list;

  // Dev-friendly defaults
  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:3000", "http://localhost:3001"];
  }

  return [];
};

const allowedOrigins = parseAllowedOrigins();

const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "");

const isOriginAllowed = (origin) => {
  const candidate = normalizeOrigin(origin);
  if (!candidate) return true;
  if (allowedOrigins.length === 0) return true;

  for (const entry of allowedOrigins) {
    const rule = normalizeOrigin(entry);
    if (!rule) continue;

    // Support simple wildcard rules like: https://*.vercel.app
    if (rule.includes("*")) {
      const escaped = rule.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      const re = new RegExp(`^${escaped}$`);
      if (re.test(candidate)) return true;
      continue;
    }

    if (rule === candidate) return true;
  }

  return false;
};

const corsOrigin = (origin, callback) => {
  // Allow non-browser tools (no Origin header)
  if (!origin) return callback(null, true);
  if (isOriginAllowed(origin)) return callback(null, true);
  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(cookieParser()); // Parse cookies
app.use(express.json()); //to convert request data to json

app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀");
});

app.use("/media", express.static(path.join(__dirname, "media")));

app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use("/api/student", require("./routes/details/student-details.route"));
app.use("/api/alumni", require("./routes/details/alumni-details.route"));
app.use("/api/coordinator", require("./routes/coordinator.route"));
app.use("/api/societies", require("./routes/society.route"));

app.use("/api/branch", require("./routes/branch.route"));
app.use("/api/subject", require("./routes/subject.route"));
app.use("/api/notice", require("./routes/notice.route"));
app.use("/api/timetable", require("./routes/timetable.route"));
app.use("/api/material", require("./routes/material.route"));
app.use("/api/exam", require("./routes/exam.route"));
app.use("/api/marks", require("./routes/marks.route"));
app.use("/api/ai", require("./routes/ai.route"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// key format prevents collisions between collections
const socketKey = (role, userId) => `${role}:${userId}`;
const userSocketMap = new Map();

const getAuthFromToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId || !decoded?.role) return null;
    if (!["student", "alumni"].includes(decoded.role)) return null;
    return { userId: String(decoded.userId), role: decoded.role };
  } catch {
    return null;
  }
};

io.on("connection", async (socket) => {
  const token = socket.handshake?.auth?.token;
  const auth = getAuthFromToken(token);
  if (!auth) {
    socket.disconnect(true);
    return;
  }

  const key = socketKey(auth.role, auth.userId);
  if (!userSocketMap.has(key)) {
    userSocketMap.set(key, new Set());
  }
  userSocketMap.get(key).add(socket.id);

  socket.on("chat:send", async ({ toRole, toUserId, text }) => {
    try {
      if (!toRole || !toUserId || !text || !String(text).trim()) return;
      if (!["student", "alumni"].includes(toRole)) return;
      if (toRole === auth.role) return;

      const studentId = auth.role === "student" ? auth.userId : String(toUserId);
      const alumniId = auth.role === "alumni" ? auth.userId : String(toUserId);

      const conversation = await getOrCreateConversation({ studentId, alumniId });
      if (!conversation) return;

      const message = await createMessage({
        conversation,
        senderRole: auth.role,
        senderId: auth.userId,
        text: String(text).trim(),
      });

      // Broadcast to sender + recipient sockets
      const payload = {
        _id: message._id,
        conversationId: conversation._id,
        fromRole: auth.role,
        fromUserId: auth.userId,
        toRole,
        toUserId: String(toUserId),
        text: message.text,
        createdAt: message.createdAt,
      };

      const senderSockets = userSocketMap.get(socketKey(auth.role, auth.userId)) || new Set();
      for (const socketId of senderSockets) {
        io.to(socketId).emit("chat:receive", payload);
      }

      const recipientSockets = userSocketMap.get(socketKey(toRole, String(toUserId))) || new Set();
      for (const socketId of recipientSockets) {
        io.to(socketId).emit("chat:receive", payload);
      }
    } catch (err) {
      console.error("chat:send error:", err);
    }
  });

  socket.on("disconnect", () => {
    const sockets = userSocketMap.get(key);
    if (!sockets) return;
    sockets.delete(socket.id);
    if (sockets.size === 0) userSocketMap.delete(key);
  });
});

connectToMongo()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server Listening On http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Fatal: MongoDB connection failed. Server not started.", err?.message || err);
    process.exit(1);
  });
