// backend/src/server.js
require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT || 5000);

// Connect DB first, then start server
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log("ENV CHECK:", process.env.MONGO_URI);
      throw new Error("MONGO_URI is missing in environment variables");
    }

    await connectDB();
    console.log("✅ DB connected");

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${
          process.env.NODE_ENV || "development"
        } on port ${PORT}`
      );
    });
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
})();
