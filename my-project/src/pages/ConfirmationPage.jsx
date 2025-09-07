// src/pages/ConfirmationPage.jsx
import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Title, Meta } from "react-head";
import api from "../api/client";
import { BookingContext } from "../context/BookingContext";

const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));

function safeArrayTitles(arr) {
  return Array.isArray(arr) && arr.length
    ? arr
        .map((s) => (s && (s.title || s)) || "")
        .filter(Boolean)
        .join(", ")
    : "None";
}

function safeText(value, fallback = "N/A") {
  if (value === 0) return "0";
  return value ? String(value) : fallback;
}

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  const [bookingData, setBookingData] = useState(state || null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false);

  const { confirmBooking } = useContext(BookingContext);

  useEffect(() => {
    if (!state && !bookingData) {
      setError("No booking data provided");
    }
  }, [state, bookingData]);

  const onConfirmClick = useCallback(async () => {
    if (!bookingData || disabled) return;
    setDisabled(true);
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const {
        customerInfo = {},
        vehicleInfo = {},
        selectedServices = [],
        selectedAddons = [],
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
        totalPrice:
          typeof totalPrice === "number" ? totalPrice : Number(totalPrice) || 0,
        startAt: startAtISO,
        notes: notes || "",
        address: customerInfo?.address || "",
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await api("/api/bookings", {
        method: "POST",
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const booking = response?.booking || response?.data || response || null;
      if (!booking) {
        setError("Booking failed. Please try again.");
        setDisabled(false);
        setConfirmed(false);
        return;
      }

      const merged = {
        ...bookingData,
        ...booking,
        customerInfo: {
          ...(bookingData.customerInfo || {}),
          ...(booking.customerInfo || {}),
        },
        vehicleInfo: {
          ...(bookingData.vehicleInfo || {}),
          ...(booking.vehicleInfo || {}),
        },
        selectedServices:
          booking.selectedServices || bookingData.selectedServices || [],
        selectedAddons:
          booking.selectedAddons || bookingData.selectedAddons || [],
        totalPrice: booking.totalPrice ?? bookingData.totalPrice,
        startAtISO:
          booking.startAtISO ?? booking.startAt ?? bookingData.startAtISO,
      };

      setBookingData(merged);
      setConfirmed(true);
      setMessage("Booking successfully confirmed.");

      // ✅ Clear booking draft/context AFTER local state is set
      try {
        confirmBooking(); // clears BookingContext + localStorage draft
        localStorage.removeItem("precision_booking_draft_v1"); // extra safety
      } catch (e) {
        console.warn("confirmBooking cleanup failed:", e);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(
          err?.message || "Something went wrong while confirming booking"
        );
      }
      setConfirmed(false);
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  }, [bookingData, confirmBooking, disabled]);

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

  // Values for display
  const servicesText = safeArrayTitles(bookingData.selectedServices);
  const addonsText = safeArrayTitles(bookingData.selectedAddons);
  const customerName = bookingData.customerInfo?.name || "N/A";
  const customerEmail = bookingData.customerInfo?.email || "";
  const customerPhone = bookingData.customerInfo?.phone || "";
  const address = bookingData.customerInfo?.address || "No address provided";
  const startAt = bookingData.startAtISO || bookingData.startAt || null;
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
      ? `$${bookingData.totalPrice.toFixed(2)}`
      : safeText(bookingData.totalPrice, "N/A");

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <Suspense fallback={<div className="h-20 bg-gray-800 animate-pulse" />}>
        <Header />
      </Suspense>

      <Suspense fallback={null}>
        <FloatingContact />
      </Suspense>

      <Suspense fallback={<div className="h-6 bg-gray-700 animate-pulse" />}>
        <ProgressTracker currentStep={4} />
      </Suspense>

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
            <div aria-live="polite" className="mt-2">
              {message && <p className="text-sm text-gray-300">{message}</p>}
              {loading && (
                <p className="text-sm text-blue-300">Confirming booking…</p>
              )}
            </div>
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
                disabled={loading || disabled}
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

      <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
