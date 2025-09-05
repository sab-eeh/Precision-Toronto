import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import ProgressTracker from "../components/ProgressTracker";
import FloatingContact from "../components/FloatingContact";
import { BookingContext } from "../context/BookingContext";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { api } from "../api/client";
import { Title, Meta } from "react-head";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState(state || null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // fallback if no state is passed
  useEffect(() => {
    if (!state) {
      setError("No booking data provided");
    }
  }, [state]);

  const { confirmBooking } = useContext(BookingContext);

  const onConfirmClick = async () => {
    if (!bookingData) return;

    try {
      setLoading(true);
      setMessage("");

      const {
        customerInfo,
        vehicleInfo,
        selectedServices,
        selectedAddons,
        totalPrice,
        notes,
        startAtISO,
        slotMinutes,
      } = bookingData;

      const payload = {
        customerInfo,
        vehicleInfo,
        selectedServices: Array.isArray(selectedServices)
          ? selectedServices.map((s) => ({
              _id: s._id || null,
              title: s.title,
              price: s.price,
              durationMinutes: s.durationMinutes || slotMinutes || 60,
            }))
          : [],
        selectedAddons: selectedAddons || [],
        totalPrice,
        startAt: startAtISO,
        notes: notes || "",
        address: customerInfo?.address || "",
      };

      // Send booking to backend
      const data = await api("/api/bookings", {
        method: "POST",
        body: payload,
      });

      const booking = data?.booking || data?.data || null;

      if (booking) {
        setBookingData(booking);
        setConfirmed(true);
        setMessage("Booking successfully confirmed.");

        // ✅ clear local draft + reset state
        confirmBooking();
      } else {
        setError("Booking failed. Please try again.");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong while confirming booking");
    } finally {
      setLoading(false);
    }
  };
  // helpers
  const safeArrayTitles = (arr) =>
    Array.isArray(arr) && arr.length
      ? arr
          .map((s) => s?.title || s)
          .filter(Boolean)
          .join(", ")
      : "None";

  const safeText = (value, fallback = "N/A") =>
    value ? String(value) : fallback;

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0F1C] text-white p-6">
        <div className="p-6 rounded-xl bg-[#1b212f] text-center w-full max-w-lg">
          <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0F1C] text-white p-6">
        <div className="p-6 rounded-xl bg-[#111827] text-center w-full max-w-lg">
          <p className="mb-4">No booking data found.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // prepare values
  const servicesText = safeArrayTitles(bookingData.selectedServices);
  const addonsText = safeArrayTitles(bookingData.selectedAddons);
  const customerName = bookingData.customerInfo?.name || "N/A";
  const customerEmail = bookingData.customerInfo?.email || "";
  const customerPhone = bookingData.customerInfo?.phone || "";
  const address = bookingData.customerInfo?.address || "No address provided";
  const startAt = bookingData.startAtISO || null;
  const displayDate = startAt
    ? format(new Date(startAt), "EEEE, MMMM d, yyyy")
    : "N/A";
  const displayTime = startAt ? format(new Date(startAt), "h:mm a") : "N/A";
  const vehicle = bookingData.vehicleInfo || {};
  const vehicleText =
    [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ") ||
    "Not specified";
  const total =
    typeof bookingData.totalPrice === "number"
      ? `$${bookingData.totalPrice}`
      : safeText(bookingData.totalPrice, "N/A");

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white ">
      <Header />
      <FloatingContact />
      <ProgressTracker currentStep={4} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={18} /> Back
          </Button>
          <h1 className="text-3xl font-bold">Back to Booking</h1>
        </div>
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {confirmed ? "Booking Confirmed!" : "Review Your Booking"}
            </h1>
            <p className="text-gray-400 text-lg">
              {confirmed
                ? "Your appointment has been scheduled."
                : "Please confirm your booking details below."}
            </p>
            {message && <p className="text-sm text-gray-300 mt-2">{message}</p>}
          </div>

          {/* Booking Details */}
          <div className="bg-[#0F1724] rounded-xl p-6 mb-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Services</h3>
              <p className="text-gray-300">{servicesText}</p>
              {addonsText !== "None" && (
                <p className="text-sm text-gray-400 mt-1">
                  Add-ons: {addonsText}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Date & Time</h3>
              <p className="text-gray-300">{displayDate}</p>
              <p className="text-sm text-gray-400">{displayTime}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-300">{address}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Customer</h3>
              <p className="text-gray-300">{customerName}</p>
              {customerEmail && (
                <p className="text-sm text-gray-400">{customerEmail}</p>
              )}
              {customerPhone && (
                <p className="text-sm text-gray-400">{customerPhone}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle</h3>
              <p className="text-gray-300">{vehicleText}</p>
              {vehicle?.color && (
                <p className="text-sm text-gray-400">Color: {vehicle.color}</p>
              )}
              {vehicle?.plate && (
                <p className="text-sm text-gray-400">Plate: {vehicle.plate}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Payment</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-xl font-bold text-primary">{total}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Payment due at service completion
              </p>
            </div>

            {bookingData.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Special Instructions
                </h3>
                <p className="text-gray-300">{bookingData.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Status:</span>
              <Badge
                className={
                  confirmed
                    ? "bg-success text-white"
                    : "bg-yellow-600 text-white"
                }
              >
                {confirmed ? "Confirmed" : "Pending"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!confirmed && (
              <Button
                disabled={loading}
                onClick={onConfirmClick}
                className="w-full sm:w-auto bg-primary text-white hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Confirming..." : "Confirm Booking"}
              </Button>
            )}
            <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
