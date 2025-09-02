const mongoose = require("mongoose");

const ServiceItemSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    title: { type: String, trim: true, required: true },
    price: { type: Number, min: 0, required: true },
    durationMinutes: { type: Number, min: 1, default: 60 },
  },
  { _id: false }
);

const VehicleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["sedan", "suv", "coupe", "truck", "van", "other"],
      default: "sedan",
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    year: { type: String, trim: true },
    color: { type: String, trim: true },
    plate: { type: String, trim: true },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, maxlength: 120 },
    phone: { type: String, required: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true },

    address: { type: String, trim: true, maxlength: 300 },

    vehicle: { type: VehicleSchema, default: {} },

    services: {
      type: [ServiceItemSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
      required: true,
    },

    addons: { type: Array, default: [] },

    totalPrice: { type: Number, min: 0, required: true },

    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },

    notes: { type: String, maxlength: 1000 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
      default: "confirmed",
    },

    source: { type: String, enum: ["web", "admin"], default: "web" },
  },
  { timestamps: true }
);

// Useful composite index for overlap queries
BookingSchema.index({ startAt: 1, endAt: 1, status: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
