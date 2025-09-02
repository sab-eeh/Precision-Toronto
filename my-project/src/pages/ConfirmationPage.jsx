import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import ProgressTracker from "../components/ProgressTracker";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { CheckCircle, Calendar, MapPin, Car, Mail } from "lucide-react";
import { format } from "date-fns";
import { api } from "../api/client";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!state) {
      setLoading(false);
      setError("No booking data provided");
      return;
    }

    (async () => {
      try {
        setPosting(true);

        const {
          selectedDate,     // Date object
          selectedTime,     // "h:mm a" label
          customerInfo,
          vehicleInfo,
          selectedServices,
          selectedAddons,
          totalPrice,
          notes,
          startAtISO,       // ISO from availability slot
          slotMinutes,      // minutes per slot
        } = state;

        // Build payload expected by backend
        const payload = {
          customerInfo,
          vehicleInfo,
          selectedServices: selectedServices.map((s) => ({
            _id: s._id || null,
            title: s.title,
            price: s.price,
            durationMinutes: s.durationMinutes || slotMinutes || 60,
          })),
          selectedAddons: selectedAddons || [],
          totalPrice,
          startAt: startAtISO, // trusted from selected slot
          notes: notes || "",
          address: customerInfo.address || "",
        };

        const data = await api("/api/bookings", {
          method: "POST",
          body: payload,
        });

        setBookingData(data.booking);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong while confirming booking");
      } finally {
        setPosting(false);
        setLoading(false);
      }
    })();
  }, [state]);

  if (!state) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-hero text-white p-10">
        <div className="p-8 rounded-xl border border-border bg-card text-center w-full max-w-xl">
          No booking data found.
          <Button className="mt-4" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Processing your booking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0F1C] text-white p-10">
        <div className="p-8 rounded-xl border border-red-600/40 bg-[#1b212f] text-center w-full max-w-xl">
          <h2 className="text-2xl font-semibold text-red-400 mb-2">Oops!</h2>
          <p className="text-red-300">{error}</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero text-white">
      <Header />
      <ProgressTracker currentStep={4} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full border border-border mx-auto mb-4 flex items-center justify-center bg-primary/20">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your appointment has been successfully scheduled
            </p>
          </div>

          {/* Booking Details */}
          <div className="bg-card rounded-xl border border-border p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Appointment Details</h2>
              <Badge className="bg-success text-white">
                {bookingData.status?.charAt(0).toUpperCase() + bookingData.status?.slice(1) || "Confirmed"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Services */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Services</h3>
                    <p className="text-muted-foreground">
                      {bookingData.services.map((s) => s.title).join(", ")}
                    </p>
                    {bookingData.addons?.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add-ons:{" "}
                        {bookingData.addons
                          .map((a) => (typeof a === "string" ? a : a.title ?? ""))
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Date & Time</h3>
                    <p className="text-muted-foreground">
                      {format(new Date(bookingData.startAt), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(bookingData.startAt), "h:mm a")}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">
                      {bookingData.address || "No address provided"}
                    </p>
                    <p className="text-sm text-muted-foreground">Mobile service</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Customer</h3>
                    <p className="text-muted-foreground">{bookingData.customerName}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.email}</p>
                    <p className="text-sm text-muted-foreground">{bookingData.phone}</p>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Vehicle</h3>
                    <p className="text-muted-foreground">
                      {bookingData.vehicle?.year} {bookingData.vehicle?.make} {bookingData.vehicle?.model}
                    </p>
                    {bookingData.vehicle?.color && (
                      <p className="text-sm text-muted-foreground">
                        {bookingData.vehicle.color}
                      </p>
                    )}
                    {bookingData.vehicle?.plate && (
                      <p className="text-sm text-muted-foreground">
                        Plate: {bookingData.vehicle.plate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="border border-border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ${bookingData.totalPrice}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payment due at service completion
                  </p>
                </div>
              </div>
            </div>

            {bookingData.notes && (
              <div className="mt-6 p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <p className="text-muted-foreground">{bookingData.notes}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">What Happens Next?</h3>
            <p className="text-muted-foreground">
              A technician will contact you on the provided phone number to confirm your appointment and arrival time.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              disabled={posting}
              onClick={() => navigate("/")}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
