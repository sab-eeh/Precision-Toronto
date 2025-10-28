// backend/src/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not set");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== "production",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("Mongo connection error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Mongo disconnected");
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
