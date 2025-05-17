const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ========================
// 🔌 Socket.IO Logic
// ========================
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

// ========================
// 🧠 Code Execution Routes
// ========================
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


const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running (HTTP + Socket.IO) on port ${PORT}`);
});
