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
import { parseDuration } from "../utils/duration"; // ✅ FIX: import duration parser

const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));

const DRAFT_KEY = "precision_booking_draft_v2";

// Format YYYY-MM-DD local
function formatYMDLocal(date) {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseYMDToLocalDate(ymd) {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// ✅ FIX: Convert service/addon duration into numeric minutes
function toDurationMinutes(item) {
  if (!item) return 60;

  // already numeric
  const direct = Number(item.durationMinutes);
  if (Number.isFinite(direct) && direct > 0) return direct;

  // parse from string
  if (typeof item.duration === "string" && item.duration.trim()) {
    const parsed = parseDuration(item.duration);
    if (parsed?.avg && parsed.avg > 0) return parsed.avg;
  }

  return 60;
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { booking, setBooking } = useContext(BookingContext);

  if (
    !state &&
    !booking?.services?.length &&
    !booking?.selectedServices?.length
  ) {
    return <div className="p-10 text-center">No booking data found.</div>;
  }

  // Keep original behavior: state has priority, then booking context
  const raw = state || booking || {};

  const selectedCar = raw.selectedCar;
  const totalPrice = raw.totalPrice;
  const durationSummary = raw.durationSummary; // may exist from previous step
  const formattedDurations = raw.formattedDurations;

  // ✅ FIX: Ensure selectedServices always contain durationMinutes
  const selectedServices = useMemo(() => {
    const list = Array.isArray(raw.selectedServices)
      ? raw.selectedServices
      : booking?.selectedServices || [];
    return list.map((s) => ({
      ...s,
      durationMinutes: toDurationMinutes(s),
    }));
  }, [raw.selectedServices, booking?.selectedServices]);

  // ✅ FIX: Ensure selectedAddons always contain durationMinutes
  const selectedAddons = useMemo(() => {
    const list = Array.isArray(raw.selectedAddons)
      ? raw.selectedAddons
      : booking?.selectedAddons || [];
    return list.map((a) => ({
      ...a,
      durationMinutes: toDurationMinutes(a),
    }));
  }, [raw.selectedAddons, booking?.selectedAddons]);

  // If you don't have `durationSummary`, compute here as a fallback
  const computedDuration = useMemo(() => {
    const s = Array.isArray(selectedServices) ? selectedServices : [];
    const a = Array.isArray(selectedAddons) ? selectedAddons : [];
    const total =
      s.reduce((sum, it) => sum + (Number(it.durationMinutes) || 0), 0) +
      a.reduce((sum, it) => sum + (Number(it.durationMinutes) || 0), 0);
    return total > 0 ? total : 60;
  }, [selectedServices, selectedAddons]);

  // Use summary avg if exists, else computed
  const effectiveDuration = durationSummary?.avg || computedDuration;

  const [selectedDate, setSelectedDate] = useState(() =>
    booking?.selectedDate ? parseYMDToLocalDate(booking.selectedDate) : null
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

  // Persist draft (debounced)
  useEffect(() => {
    const handle = setTimeout(() => {
      const draft = {
        selectedDate: selectedDate ? formatYMDLocal(selectedDate) : null,
        selectedTime: selectedTime || "",
        customerInfo,
        vehicleInfo,
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* ignore quota */
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [selectedDate, selectedTime, customerInfo, vehicleInfo]);

  // Load slots when date changes
  useEffect(() => {
    setSlotsError("");
    setAvailableSlots([]);
    setSelectedTime("");
    if (!selectedDate) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      try {
        setLoadingSlots(true);
        const ymd = formatYMDLocal(selectedDate);

        // ✅ FIX: durationMinutes now always correct
        const url = `/api/bookings/availability?date=${ymd}&durationMinutes=${Math.round(
          effectiveDuration
        )}`;

        const data = await api(url, { signal: controller.signal });
        if (!alive) return;

        const slots = (data?.availableSlots || []).map((s) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          label: format(new Date(s.start), "h:mm a"),
          booked: !!s.booked,
        }));

        setAvailableSlots(slots);
      } catch (err) {
        if (err?.name !== "AbortError") {
          setSlotsError(err?.message || "Failed to load availability");
        }
      } finally {
        if (alive) setLoadingSlots(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [selectedDate, effectiveDuration]);

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

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!selectedDate || !selectedTime) return;

      const selectedSlot = availableSlots.find((s) => s.label === selectedTime);
      if (!selectedSlot) return;

      const localYMD = formatYMDLocal(
        new Date(
          selectedSlot.start.getFullYear(),
          selectedSlot.start.getMonth(),
          selectedSlot.start.getDate()
        )
      );

      // ✅ FIX: pass services/addons WITH durationMinutes
      const bookingData = {
        selectedDate: localYMD,
        selectedTime,
        customerInfo,
        vehicleInfo,
        selectedServices,
        selectedAddons,
        selectedCar,
        totalPrice,
        notes: customerInfo.notes || "",
        startAtISO: selectedSlot.start.toISOString(),
        slotMinutes: effectiveDuration,
        durationSummary: durationSummary || {
          avg: effectiveDuration,
          min: effectiveDuration,
          max: effectiveDuration,
        },
        formattedDurations,
      };

      setBooking((prev) => ({ ...prev, ...bookingData }));
      setSubmitting(true);
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
      formattedDurations,
      durationSummary,
      effectiveDuration,
      setBooking,
      navigate,
    ]
  );

  const slotsSkeleton = Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="h-10 rounded-md bg-[#121826] animate-pulse" />
  ));

  return (
    <>
      <Title>Book Car Detailing | Precision</Title>
      <Meta name="description" content="Book your car detailing appointment." />

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
                    <p className="text-xs text-gray-400 mt-1">
                      Estimated service duration:{" "}
                      <span className="text-blue-300">
                        {Math.round(effectiveDuration)} minutes
                      </span>
                    </p>
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
                  {effectiveDuration && (
                    <SummaryRow
                      label="Estimated Duration:"
                      value={`${Math.round(effectiveDuration)} minutes`}
                    />
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
