// backend/src/server.js
require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT || 5000);

// Connect DB first, then start server
(async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${
        process.env.NODE_ENV || "development"
      } on port ${PORT}`
    );
  });

  // Handle unhandled rejections & exceptions cleanly
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("🔻 Shutting down...");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
    // Force exit if something hangs
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
