import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import ProgressTracker from "../components/ProgressTracker";
import FloatingContact from "../components/FloatingContact";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { CheckCircle, Calendar, MapPin, Car, Mail } from "lucide-react";
import { format } from "date-fns";
import { api } from "../api/client";
import { Title, Meta } from "react-head";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(true);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // state comes from BookingPage -> { selectedDate, selectedTime, customerInfo, vehicleInfo, ... }
    if (!state) {
      setLoading(false);
      setError("No booking data provided");
      return;
    }

    (async () => {
      try {
        setPosting(true);

        const {
          customerInfo,
          vehicleInfo,
          selectedServices,
          selectedAddons,
          totalPrice,
          notes,
          startAtISO,
          slotMinutes,
        } = state;

        // Build payload expected by backend
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
          address: (customerInfo && customerInfo.address) || "",
        };

        // POST booking to backend
        const data = await api("/api/bookings", {
          method: "POST",
          body: payload,
        });

        // backend returns { success: true, booking }
        const booking = data?.booking || data?.data || null;
        setBookingData(booking);
        setError("");
        // if backend marked it confirmed, reflect that
        if (
          booking?.status === "confirmed" ||
          booking?.status === "completed"
        ) {
          setConfirmed(true);
        }
      } catch (err) {
        setError(
          err?.message || "Something went wrong while confirming booking"
        );
      } finally {
        setPosting(false);
        setLoading(false);
      }
    })();
  }, [state]);

  // Safe helpers
  const safeArrayTitles = (arr) =>
    Array.isArray(arr) && arr.length
      ? arr
          .map((s) => s?.title || s)
          .filter(Boolean)
          .join(", ")
      : "None";

  const safeText = (value, fallback = "N/A") =>
    value ? String(value) : fallback;

  const onConfirmClick = async () => {
    // mark confirmed in UI and try to update backend if possible
    setConfirmed(true);
    setMessage("Booking marked as confirmed.");

    if (!bookingData?._id) return; // nothing to update on server

    try {
      const res = await api(`/api/bookings/${bookingData._id}`, {
        method: "PUT",
        body: { status: "confirmed" },
      });
      if (res?.booking) {
        setBookingData(res.booking);
        setMessage("Booking successfully confirmed.");
      } else {
        // sometimes API returns success:true only
        setMessage(
          "Booking confirmation requested. (If you don't see changes, refresh.)"
        );
      }
    } catch (err) {
      console.warn("Confirm update failed:", err?.message || err);
      setMessage(
        "Marked confirmed locally. Server update failed (check console)."
      );
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0F1C] text-white p-6">
        <div className="p-6 rounded-xl bg-[#111827] text-center w-full max-w-lg">
          <p className="mb-4">No booking data found.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1C] text-white">
        <p>Processing your booking...</p>
      </div>
    );
  }

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

  // bookingData may still be null if server didn't return booking; guard render
  if (!bookingData) {
    return (
      <>
        <Title>Booking Confirmation | Precision Toronto</Title>
        <Meta
          name="description"
          content="Thank you for booking with Precision Toronto. Your car detailing appointment has been confirmed. Get ready for a spotless, showroom-quality shine."
        />
        <div className="min-h-screen grid place-items-center bg-[#0A0F1C] text-white p-6">
          <div className="p-6 rounded-xl bg-[#111827] text-center w-full max-w-lg">
            <p className="mb-4">
              Booking processed but no booking details were returned.
            </p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </>
    );
  }

  // UI values with safe fallbacks
  const servicesText = safeArrayTitles(bookingData.services);
  const addonsText = safeArrayTitles(bookingData.addons);
  const customerName =
    bookingData.customerName ||
    bookingData.customerInfo?.name ||
    bookingData.customerInfo?.fullName ||
    "N/A";
  const customerEmail =
    bookingData.email ||
    bookingData.customerInfo?.email ||
    bookingData.customerInfo?.contactEmail ||
    "";
  const customerPhone =
    bookingData.phone ||
    bookingData.customerInfo?.phone ||
    bookingData.customerInfo?.contactPhone ||
    "";
  const address =
    bookingData.address ||
    bookingData.customerInfo?.address ||
    "No address provided";
  const startAt =
    bookingData.startAt || bookingData.startAtISO || bookingData.date || null;
  const displayDate = startAt
    ? format(new Date(startAt), "EEEE, MMMM d, yyyy")
    : "N/A";
  const displayTime = startAt ? format(new Date(startAt), "h:mm a") : "N/A";
  const vehicle = bookingData.vehicle || bookingData.vehicleInfo || {};
  const vehicleText =
    [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(" ") ||
    "Not specified";
  const total =
    typeof bookingData.totalPrice === "number"
      ? `$${bookingData.totalPrice}`
      : safeText(bookingData.totalPrice, "N/A");

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      <Header />
      <FloatingContact />
      <ProgressTracker currentStep={4} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Booking {confirmed ? "Confirmed!" : "Created"}
            </h1>
            <p className="text-gray-400 text-lg">
              Your appointment has been scheduled.
            </p>
            {message && <p className="text-sm text-gray-300 mt-2">{message}</p>}
          </div>

          {/* Booking Details (clean, minimal, no heavy borders/shadows) */}
          <div className="bg-transparent rounded-xl p-0 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6 bg-[#0F1724] p-6 rounded-xl">
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
                  <p className="text-sm text-gray-400">Mobile service</p>
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
              </div>

              {/* Right column */}
              <div className="space-y-6 bg-[#0F1724] p-6 rounded-xl">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vehicle</h3>
                  <p className="text-gray-300">{vehicleText}</p>
                  {vehicle?.color && (
                    <p className="text-sm text-gray-400">
                      Color: {vehicle.color}
                    </p>
                  )}
                  {vehicle?.plate && (
                    <p className="text-sm text-gray-400">
                      Plate: {vehicle.plate}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-xl font-bold text-primary">
                      {total}
                    </span>
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

                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Status:</span>
                    <Badge
                      className={
                        confirmed
                          ? "bg-success text-white"
                          : "bg-yellow-600 text-white"
                      }
                    >
                      {confirmed
                        ? "Confirmed"
                        : bookingData.status
                        ? bookingData.status
                        : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-[#0F1724] p-6 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-2">What Happens Next?</h3>
            <p className="text-gray-400">
              A technician will contact you on the provided phone number to
              confirm the appointment and arrival time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              disabled={posting || confirmed}
              onClick={onConfirmClick}
              className="w-full sm:w-auto bg-primary text-white hover:opacity-90 disabled:opacity-60"
            >
              {confirmed ? "Confirmed" : "Confirm Booking"}
            </Button>

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
