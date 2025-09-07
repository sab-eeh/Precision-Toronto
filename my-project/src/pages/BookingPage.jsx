// src/pages/BookingPage.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import api from "../api/client";
import { Title, Meta } from "react-head";
import { BookingContext } from "../context/BookingContext";

// Lazy load non-critical layout pieces
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));

const BUSINESS_MINUTES_PER_SLOT = 60;
const DRAFT_KEY = "precision_booking_draft_v1";

/* ---------- Helpers ---------- */

// Format date to YYYY-MM-DD (local)
function formatYMDLocal(date) {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD into a local Date at 00:00 local time (avoid timezone shifts)
function parseYMDToLocalDate(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map((n) => Number(n));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Safely parse a booking-selectedDate value (handles legacy ISO or YMD)
function parseBookingSelectedDate(val) {
  if (!val) return null;
  if (typeof val === "string") {
    // YMD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return parseYMDToLocalDate(val);
    // ISO fallback: create Date and use local YMD
    const dt = new Date(val);
    if (!isNaN(dt))
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }
  if (val instanceof Date && !isNaN(val))
    return new Date(val.getFullYear(), val.getMonth(), val.getDate());
  return null;
}

/* ---------- Component ---------- */

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { booking, setBooking } = useContext(BookingContext);

  // If user hasn't selected services and didn't come with state, show friendly message
  if (!state && !(booking && booking.services && booking.services.length)) {
    return <div className="p-10 text-center">No booking data found.</div>;
  }

  // If route provided services (user navigated from Services), prefer that;
  // otherwise fall back to booking context.
  const { selectedCar, selectedServices, selectedAddons, totalPrice } =
    state || booking || {};

  // Initialize states (preferred: booking or blank)
  const [selectedDate, setSelectedDate] = useState(() =>
    parseBookingSelectedDate(booking?.selectedDate)
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(booking?.selectedTime || "");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [customerInfo, setCustomerInfo] = useState(
    booking?.customerInfo || {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    }
  );

  const [vehicleInfo, setVehicleInfo] = useState(
    booking?.vehicleInfo || {
      make: "",
      model: "",
      year: "",
      color: "",
      license: "",
    }
  );

  /* ---------- Restore draft only when relevant ---------- 
     We avoid restoring draft for "brand new" users (no state AND no booking.services)
     This prevents showing old customer data to a new user.
  */
  useEffect(() => {
    const shouldRestore = !!(
      state ||
      (booking && booking.services && booking.services.length)
    );
    if (!shouldRestore) {
      // Remove stale draft and keep inputs blank (new user)
      localStorage.removeItem(DRAFT_KEY);
      setSelectedDate(null);
      setSelectedTime("");
      setCustomerInfo({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      setVehicleInfo({ make: "", model: "", year: "", color: "", license: "" });
      return;
    }

    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);

      // Prefer a full startAtISO if present (more precise)
      if (parsed?.startAtISO) {
        const start = new Date(parsed.startAtISO);
        if (!isNaN(start)) {
          setSelectedDate(
            new Date(start.getFullYear(), start.getMonth(), start.getDate())
          );
          // Use time label if saved or compute from ISO
          setSelectedTime(parsed.selectedTime || format(start, "h:mm a"));
        }
      } else if (parsed?.selectedDateYMD) {
        const d = parseYMDToLocalDate(parsed.selectedDateYMD);
        if (d) setSelectedDate(d);
        setSelectedTime(parsed.selectedTime || "");
      } else if (parsed?.selectedDate) {
        // legacy
        const d = parseBookingSelectedDate(parsed.selectedDate);
        if (d) setSelectedDate(d);
        setSelectedTime(parsed.selectedTime || "");
      }

      setCustomerInfo(parsed.customerInfo || booking?.customerInfo || {});
      setVehicleInfo(parsed.vehicleInfo || booking?.vehicleInfo || {});
    } catch (err) {
      // If parse fails, drop the draft
      localStorage.removeItem(DRAFT_KEY);
    }
    // We intentionally depend on booking.services and state — restore only when they change.
  }, [state, booking?.services]);

  /* ---------- Persist draft (debounced) ---------- */
  useEffect(() => {
    // Only persist if user actually has services selected (so we don't create drafts for random visitors)
    const shouldPersist = !!(
      state ||
      (booking && booking.services && booking.services.length)
    );
    if (!shouldPersist) return;

    const handle = setTimeout(() => {
      const draft = {
        selectedDateYMD: selectedDate ? formatYMDLocal(selectedDate) : null,
        selectedTime: selectedTime || "",
        // keep startAtISO if present in booking (helps precise restore)
        startAtISO: booking?.startAtISO || null,
        customerInfo,
        vehicleInfo,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (e) {
        // ignore quota errors
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [
    selectedDate,
    selectedTime,
    customerInfo,
    vehicleInfo,
    state,
    booking?.services,
    booking?.startAtISO,
  ]);

  /* ---------- Fetch available slots for selectedDate ---------- */
  useEffect(() => {
    // reset status
    setSlotsError("");
    setAvailableSlots([]);
    setSelectedTime("");

    if (!selectedDate) return;

    const controller = new AbortController();
    let active = true;

    (async () => {
      try {
        setLoadingSlots(true);
        const ymd = formatYMDLocal(selectedDate);
        // The api client supports options (method/signal) in other files, so pass signal
        const data = await api(`/api/bookings/availability?date=${ymd}`, {
          signal: controller.signal,
        });
        if (!active) return;
        const slots = (data?.availableSlots || []).map((s) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          label: format(new Date(s.start), "h:mm a"),
          booked: s.booked || false,
        }));
        setAvailableSlots(slots);
      } catch (err) {
        if (err?.name === "AbortError") {
          // aborted - ignore
          return;
        }
        setSlotsError(err?.message || "Failed to load availability");
      } finally {
        if (active) setLoadingSlots(false);
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedDate]);

  /* ---------- Submit handler ---------- */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedDate || !selectedTime) return;

      const selectedSlot = availableSlots.find((s) => s.label === selectedTime);
      if (!selectedSlot) return;

      // Derive booking date from the chosen slot's local date (avoid timezone shifts)
      const localYMD = formatYMDLocal(
        new Date(
          selectedSlot.start.getFullYear(),
          selectedSlot.start.getMonth(),
          selectedSlot.start.getDate()
        )
      );

      const bookingData = {
        // store date as YYYY-MM-DD local string (stable across timezones)
        selectedDate: localYMD,
        selectedTime,
        customerInfo,
        vehicleInfo,
        selectedServices,
        selectedAddons,
        selectedCar,
        totalPrice,
        notes: customerInfo.notes || "",
        // precise timestamp for backend & confirmation
        startAtISO: selectedSlot.start.toISOString(),
        slotMinutes: BUSINESS_MINUTES_PER_SLOT,
      };

      // Save to context (draft)
      setBooking((prev) => ({ ...prev, ...bookingData }));

      setSubmitting(true);
      // Navigate to Confirmation page, passing bookingData in state (confirmation page will merge and POST)
      navigate("/confirmation", { state: bookingData });
    },
    [
      selectedDate,
      selectedTime,
      availableSlots,
      customerInfo,
      vehicleInfo,
      selectedServices,
      selectedAddons,
      selectedCar,
      totalPrice,
      setBooking,
      navigate,
    ]
  );

  /* ---------- Form validation (memoized) ---------- */
  const isFormValid = useMemo(
    () =>
      selectedDate &&
      selectedTime &&
      customerInfo?.name &&
      customerInfo?.email &&
      customerInfo?.phone &&
      customerInfo?.address &&
      vehicleInfo?.make &&
      vehicleInfo?.model &&
      vehicleInfo?.year,
    [selectedDate, selectedTime, customerInfo, vehicleInfo]
  );

  const servicesSummary = useMemo(
    () => (selectedServices || []).map((s) => s.title).join(", "),
    [selectedServices]
  );

  /* ---------- UI placeholders for slots when loading ---------- */
  const slotsSkeleton = Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="h-10 rounded-md bg-[#121826] animate-pulse" />
  ));

  /* ---------- Rendering ---------- */
  return (
    <>
      <Title>Book Car Detailing in Toronto | Precision Toronto</Title>
      <Meta
        name="description"
        content="Book your car cleaning and detailing appointment with Precision Toronto."
      />

      <div className="min-h-screen bg-[#0A0F1C] flex flex-col text-white">
        <Suspense fallback={<div className="h-20 bg-gray-800 animate-pulse" />}>
          <Header />
        </Suspense>

        <Suspense fallback={null}>
          <FloatingContact />
        </Suspense>

        <Suspense fallback={<div className="h-6 bg-gray-700 animate-pulse" />}>
          <ProgressTracker currentStep={3} />
        </Suspense>

        <div className="container mx-auto px-4 md:px-8 py-10 flex-1">
          <div className="flex items-center gap-4 mb-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-lg px-4 py-2 bg-[#1A2234] hover:bg-gray-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Book Your Appointment</h1>
              <p className="text-gray-400 mt-2 text-sm">
                {servicesSummary || "Selected services"} for{" "}
                <span className="capitalize font-medium text-blue-400">
                  {selectedCar || "your vehicle"}
                </span>
              </p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Date & Time */}
              <section className="bg-[#111827] p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-400" /> Select Date
                  & Time
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <Label>Preferred Date</Label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()}
                      className="w-full rounded-lg bg-[#1A2234] text-white px-4 py-3 border border-gray-700"
                      placeholderText="Pick a date"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>

                  <div>
                    <Label>Preferred Time</Label>

                    <div className="mt-3" aria-live="polite">
                      {loadingSlots && (
                        <p className="text-sm text-blue-300">Loading slots…</p>
                      )}
                      {slotsError && (
                        <p className="text-sm text-red-400">{slotsError}</p>
                      )}
                      {!loadingSlots &&
                        selectedDate &&
                        availableSlots.length === 0 && (
                          <p className="text-sm text-yellow-300">
                            No slots available for this date.
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {loadingSlots
                        ? slotsSkeleton
                        : availableSlots.map((slot) => (
                            <Button
                              key={slot.label}
                              type="button"
                              variant={
                                selectedTime === slot.label
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                !slot.booked && setSelectedTime(slot.label)
                              }
                              disabled={slot.booked}
                              className={cn(
                                "rounded-md py-2 text-sm text-white border border-gray-700",
                                slot.booked
                                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                  : selectedTime === slot.label
                                  ? "bg-blue-500 text-white"
                                  : "bg-[#1A2234] hover:bg-[#223048] text-gray-200"
                              )}
                            >
                              {slot.label} {slot.booked && "(Booked)"}
                            </Button>
                          ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Customer Info */}
              <section className="bg-[#111827] p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-400" /> Customer
                  Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="name"
                    label="Full Name *"
                    value={customerInfo.name}
                    onChange={(val) =>
                      setCustomerInfo((p) => ({ ...p, name: val }))
                    }
                    required
                  />
                  <InputField
                    id="email"
                    type="email"
                    label="Email Address *"
                    value={customerInfo.email}
                    onChange={(val) =>
                      setCustomerInfo((p) => ({ ...p, email: val }))
                    }
                    required
                  />
                  <InputField
                    id="phone"
                    type="tel"
                    label="Phone Number *"
                    value={customerInfo.phone}
                    onChange={(val) =>
                      setCustomerInfo((p) => ({ ...p, phone: val }))
                    }
                    required
                  />
                  <InputField
                    id="address"
                    label="Service Address *"
                    value={customerInfo.address}
                    onChange={(val) =>
                      setCustomerInfo((p) => ({ ...p, address: val }))
                    }
                    required
                  />
                </div>

                <div className="mt-6">
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo((p) => ({ ...p, notes: e.target.value }))
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    placeholder="Any special instructions..."
                  />
                </div>
              </section>

              {/* Vehicle Info */}
              <section className="bg-[#111827] p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" /> Vehicle Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField
                    id="make"
                    label="Make *"
                    value={vehicleInfo.make}
                    onChange={(val) =>
                      setVehicleInfo((p) => ({ ...p, make: val }))
                    }
                    required
                  />
                  <InputField
                    id="model"
                    label="Model *"
                    value={vehicleInfo.model}
                    onChange={(val) =>
                      setVehicleInfo((p) => ({ ...p, model: val }))
                    }
                    required
                  />
                  <InputField
                    id="year"
                    label="Year *"
                    value={vehicleInfo.year}
                    onChange={(val) =>
                      setVehicleInfo((p) => ({ ...p, year: val }))
                    }
                    required
                  />
                  <InputField
                    id="color"
                    label="Color"
                    value={vehicleInfo.color}
                    onChange={(val) =>
                      setVehicleInfo((p) => ({ ...p, color: val }))
                    }
                  />
                  <InputField
                    id="license"
                    label="License Plate"
                    value={vehicleInfo.license}
                    onChange={(val) =>
                      setVehicleInfo((p) => ({ ...p, license: val }))
                    }
                  />
                </div>
              </section>

              {/* Summary */}
              <section className="bg-[#111827] p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <SummaryRow
                    label="Services:"
                    value={servicesSummary || "None"}
                  />
                  <SummaryRow
                    label="Vehicle:"
                    value={selectedCar || "Not specified"}
                  />
                  {selectedDate && (
                    <SummaryRow
                      label="Date:"
                      value={format(selectedDate, "MMM dd, yyyy")}
                      highlight
                    />
                  )}
                  {selectedTime && (
                    <SummaryRow label="Time:" value={selectedTime} highlight />
                  )}
                  <div className="flex justify-between pt-4 border-t border-gray-700">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-bold text-blue-400">
                      ${Number(totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </section>

              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || submitting}
                className="w-full py-4 text-lg rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Confirmation
              </Button>
            </form>
          </div>
        </div>

        <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse" />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
}

/* ---------- small memoized subcomponents ---------- */

const InputField = React.memo(function InputField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 rounded-md bg-[#1A2234] text-white"
        required={required}
      />
    </div>
  );
});

const SummaryRow = React.memo(function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={highlight ? "text-blue-400" : "capitalize"}>
        {value}
      </span>
    </div>
  );
});
