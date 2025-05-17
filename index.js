const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");

const app = express();

const allowedOrigins = [
  "https://multi-lang-compiler-frontend-ef9ispgaw.vercel.app",
  "http://localhost:3000",
];

// Configure CORS for Express REST API
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server, Postman etc.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const msg = `CORS policy does not allow access from origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    methods: ["GET", "POST", "OPTIONS"],  // include OPTIONS here
    credentials: true,
  })
);

// Handle OPTIONS preflight requests for all routes
app.options("*", cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);

// Configure Socket.IO with CORS properly
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],  // include OPTIONS here too
    credentials: true,
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code }) => {
    console.log(`Code changed in room ${roomId}: ${code}`);
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// REST API routes
app.get("/", (req, res) => {
  return res.json({ hello: "world" });
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Empty code body!" });
  }

  try {
    const filepath = await generateFile(language, code);
    const output = await executeCpp(filepath);
    return res.json({ filepath, output });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running (HTTP + Socket.IO) on port ${PORT}`);
});
