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
import { parseDuration } from "../utils/duration";

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

// ✅ FIX: always derive duration per service
function toDurationMinutes(item) {
  if (!item) return 60;

  const direct = Number(item.durationMinutes);
  if (Number.isFinite(direct) && direct > 0) return direct;

  if (typeof item.duration === "string" && item.duration.trim()) {
    const parsed = parseDuration(item.duration);
    if (parsed?.avg && parsed.avg > 0) return parsed.avg;
  }

  return 60;
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
      } = bookingData;

      // ✅ FIX: normalize services & addons properly
      const normalizedServices = Array.isArray(selectedServices)
        ? selectedServices.map((s) => ({
            _id: s?._id || null,
            title: s?.title || "Service",
            price: Number(s?.price) || 0,
            durationMinutes: toDurationMinutes(s),
          }))
        : [];

      const normalizedAddons = Array.isArray(selectedAddons)
        ? selectedAddons.map((a) => ({
            _id: a?._id || null,
            title: a?.title || "Addon",
            price: Number(a?.price) || 0,
            durationMinutes: toDurationMinutes(a),
          }))
        : [];

      const payload = {
        customerInfo,
        vehicleInfo,
        selectedServices: normalizedServices,
        selectedAddons: normalizedAddons,
        totalPrice:
          typeof totalPrice === "number" ? totalPrice : Number(totalPrice) || 0,
        startAt: startAtISO,
        notes: notes || "",
        address: customerInfo?.address || "",
        serviceType: bookingData.serviceType || "mobile",
        city: bookingData.city || null,
      };
      console.log(payload);
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

      // clear booking draft/context AFTER local state is set
      try {
        confirmBooking();
        localStorage.removeItem("precision_booking_draft_v1");
      } catch (e) {
        console.warn("confirmBooking cleanup failed:", e);
      }
    } catch (err) {
      if (err?.name === "AbortError") {
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

  // ✅ NEW: Service Type Data
  const serviceType = bookingData.serviceType || "mobile";
  const city = bookingData.city || null;
  const transportFee = Number(bookingData.transportFee || 0);

  // ✅ FINAL TOTAL (with fee)
  const finalTotal =
    typeof bookingData.totalPrice === "number"
      ? (bookingData.totalPrice + transportFee).toFixed(2)
      : safeText(bookingData.totalPrice);

  // ONLY UI/STRUCTURE UPDATED — LOGIC UNCHANGED

  const InfoBlock = ({ title, children }) => (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 mb-1">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F11] via-[#0D1418] to-[#101518] text-white overflow-x-hidden">
      <Title>Confirm Booking | Precision</Title>
      <Meta name="description" content="Confirm your booking details." />

      <Suspense fallback={null}>
        <FloatingContact />
      </Suspense>

      <Suspense fallback={<div className="h-2 bg-gray-800 animate-pulse" />}>
        <ProgressTracker currentStep={4} />
      </Suspense>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(-1)}
            className="w-fit flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft size={18} /> Back
          </Button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-left sm:text-right">
            {confirmed ? "Booking Confirmed" : "Review Booking"}
          </h1>
        </div>

        {/* SUCCESS / REVIEW HEADER */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-blue-500/10">
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>

          <p className="text-gray-400 text-sm md:text-base">
            {confirmed
              ? "Your appointment has been successfully scheduled."
              : "Please review your details before confirming."}
          </p>

          <div className="mt-2 min-h-[20px]">
            {message && <p className="text-sm text-gray-300">{message}</p>}
            {loading && (
              <p className="text-sm text-blue-300">Confirming booking...</p>
            )}
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-[#111827] rounded-xl p-4 md:p-6 space-y-5 shadow-lg">
          <InfoBlock title="Services">
            <p className="text-gray-200">{servicesText}</p>
            {addonsText !== "None" && (
              <p className="text-xs text-gray-400 mt-1">
                Add-ons: {addonsText}
              </p>
            )}
          </InfoBlock>

          <InfoBlock title="Date & Time">
            <p className="text-gray-200">{displayDate}</p>
            <p className="text-sm text-gray-400">{displayTime}</p>
          </InfoBlock>

          {/* SERVICE TYPE + LOCATION */}
          <InfoBlock title="Service Type">
            <p className="text-gray-200">
              {serviceType === "mobile" ? "Mobile Service" : "Drop-off"}
            </p>

            {serviceType === "mobile" && city && (
              <p className="text-xs text-gray-400 mt-1">City: {city}</p>
            )}
          </InfoBlock>

          <InfoBlock title="Location">
            {serviceType === "mobile" ? (
              <>
                <p className="text-gray-200">{address}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Our team will arrive at your location.
                </p>
              </>
            ) : (
              <>
                <p className="text-blue-400 font-medium">
                  85 Gillett Dr, Ajax, ON
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Please drop your vehicle at this location.
                </p>
              </>
            )}
          </InfoBlock>

          <InfoBlock title="Customer">
            <p className="text-gray-200">{customerName}</p>
            {customerEmail && (
              <p className="text-xs text-gray-400">{customerEmail}</p>
            )}
            {customerPhone && (
              <p className="text-xs text-gray-400">{customerPhone}</p>
            )}
          </InfoBlock>

          <InfoBlock title="Vehicle">
            <p className="text-gray-200">{vehicleText}</p>
            {vehicle?.color && (
              <p className="text-xs text-gray-400">Color: {vehicle.color}</p>
            )}
            {vehicle?.plate && (
              <p className="text-xs text-gray-400">Plate: {vehicle.plate}</p>
            )}
          </InfoBlock>

          {/* PAYMENT */}
          <div className="pt-4 border-t border-gray-700 space-y-2">
            {/* Transport Fee */}
            {transportFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transportation Fee</span>
                <span className="text-yellow-400">${transportFee}</span>
              </div>
            )}

            {/* TOTAL */}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-xl font-bold text-blue-400">
                ${finalTotal}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Payment due at service completion
            </p>
          </div>

          {/* NOTES */}
          {bookingData.notes && (
            <InfoBlock title="Notes">
              <p className="text-gray-200 text-sm">{bookingData.notes}</p>
            </InfoBlock>
          )}

          {/* STATUS */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-gray-400">Status:</span>
            <Badge
              className={
                confirmed
                  ? "bg-green-600 text-white"
                  : "bg-yellow-600 text-white"
              }
            >
              {confirmed ? "Confirmed" : "Pending"}
            </Badge>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {!confirmed && (
            <Button
              disabled={loading || disabled}
              onClick={onConfirmClick}
              className="w-full sm:flex-1 bg-gradient-to-r from-blue-500 to-blue-700"
            >
              {loading ? "Confirming..." : "Confirm Booking"}
            </Button>
          )}

          <Button
            onClick={() => navigate("/")}
            className="w-full sm:flex-1 bg-[#1A2234] hover:bg-[#223048]"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
