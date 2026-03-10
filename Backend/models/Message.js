const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    serviceType: {
      type: String,
      enum: ["mobile", "dropoff"],
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast conversation lookup
messageSchema.index({ from: 1, to: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
