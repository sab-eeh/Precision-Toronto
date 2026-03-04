/**
 * SERVER ENTRY POINT
 * Initializes environment, database, HTTP server and Socket.IO
 */

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT || 5000);

(async () => {
  try {
    // Validate required environment variables
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing in environment variables");
    }

    // Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected");

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:5173",
          "https://precisiontoronto.com",
          "https://www.precisiontoronto.com",
          "https://precision-toronto.vercel.app",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    // Make io accessible globally
    global.io = io;

    io.on("connection", (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
})();
