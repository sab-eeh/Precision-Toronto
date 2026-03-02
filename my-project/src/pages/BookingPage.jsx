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
import { parseDuration } from "../utils/duration";

const FloatingContact = lazy(() => import("../components/FloatingContact"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));

const DRAFT_KEY = "precision_booking_draft_v2";

/* ---------------- HELPERS ---------------- */

const formatYMDLocal = (date) => {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const parseYMDToLocalDate = (ymd) => {
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const getDurationMinutes = (item) => {
  if (!item) return 60;

  const direct = Number(item.durationMinutes);
  if (direct > 0) return direct;

  if (typeof item.duration === "string") {
    const parsed = parseDuration(item.duration);
    if (parsed?.avg) return parsed.avg;
  }

  return 60;
};

const normalizeItems = (items = []) =>
  items.map((i) => ({
    ...i,
    durationMinutes: getDurationMinutes(i),
  }));

const mapSlots = (slots = []) =>
  slots.map((s) => {
    const start = new Date(s.start);
    return {
      start,
      end: new Date(s.end),
      label: start.toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Toronto",
      }),
      booked: !!s.booked,
    };
  });

/* ---------------- COMPONENT ---------------- */

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { booking, setBooking } = useContext(BookingContext);

  /* ---------- DATA SOURCE ---------- */
  const raw = useMemo(() => {
    return state ?? booking ?? {};
  }, [state, booking]);

  if (
    !raw &&
    !booking?.services?.length &&
    !booking?.selectedServices?.length
  ) {
    return <div className="p-10 text-center">No booking data found.</div>;
  }

  const selectedCar = raw.selectedCar;
  const totalPrice = raw.totalPrice;
  const durationSummary = raw.durationSummary;
  const formattedDurations = raw.formattedDurations;

  /* ---------- NORMALIZED DATA ---------- */
  const selectedServices = useMemo(
    () =>
      normalizeItems(raw.selectedServices || booking?.selectedServices || []),
    [raw.selectedServices, booking?.selectedServices]
  );
  const servicesSummary = useMemo(() => {
    return selectedServices?.length
      ? selectedServices.map((s) => s.title).join(", ")
      : "";
  }, [selectedServices]);
  const selectedAddons = useMemo(
    () => normalizeItems(raw.selectedAddons || booking?.selectedAddons || []),
    [raw.selectedAddons, booking?.selectedAddons]
  );

  /* ---------- DURATION ---------- */
  const effectiveDuration = useMemo(() => {
    if (durationSummary?.avg) return durationSummary.avg;

    const total = [...selectedServices, ...selectedAddons].reduce(
      (sum, i) => sum + (i.durationMinutes || 0),
      0
    );

    return total || 60;
  }, [durationSummary, selectedServices, selectedAddons]);

  /* ---------- STATE ---------- */
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

  // SERVICE TYPE
  const [serviceType, setServiceType] = useState(
    booking?.serviceType || "mobile"
  );

  const [city, setCity] = useState(booking?.city || "");

  const DURHAM_CITIES = ["Ajax", "Pickering", "Whitby", "Oshawa", "Clarington"];

  const isOutsideDurham =
    serviceType === "mobile" && city && !DURHAM_CITIES.includes(city);

  const transportFee = isOutsideDurham ? 25 : 0;

  /* ---------- DRAFT SAVE ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            selectedDate: selectedDate ? formatYMDLocal(selectedDate) : null,
            selectedTime,
            customerInfo,
            vehicleInfo,
            serviceType,
            city,
          })
        );
      } catch {}
    }, 400);

    return () => clearTimeout(t);
  }, [selectedDate, selectedTime, customerInfo, vehicleInfo]);

  /* ---------- LOAD SLOTS ---------- */
  useEffect(() => {
    if (!selectedDate) return;

    const controller = new AbortController();
    setLoadingSlots(true);
    setSlotsError("");
    setAvailableSlots([]);
    setSelectedTime("");

    (async () => {
      try {
        const ymd = formatYMDLocal(selectedDate);

        const data = await api(
          `/api/bookings/availability?date=${ymd}&durationMinutes=${Math.round(
            effectiveDuration
          )}`,
          { signal: controller.signal }
        );

        setAvailableSlots(mapSlots(data?.availableSlots));
      } catch (err) {
        if (err?.name !== "AbortError") {
          setSlotsError("Failed to load availability");
        }
      } finally {
        setLoadingSlots(false);
      }
    })();

    return () => controller.abort();
  }, [selectedDate, effectiveDuration]);

  /* ---------- VALIDATION ---------- */
  const isFormValid = useMemo(() => {
    return (
      selectedDate &&
      selectedTime &&
      customerInfo.name &&
      customerInfo.email &&
      customerInfo.phone &&
      customerInfo.address &&
      vehicleInfo.make &&
      vehicleInfo.model &&
      vehicleInfo.year &&
      (serviceType === "dropoff" || city)
    );
  }, [
    selectedDate,
    selectedTime,
    customerInfo,
    vehicleInfo,
    serviceType,
    city,
  ]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const slot = availableSlots.find((s) => s.label === selectedTime);
      if (!slot) return;

      const bookingData = {
        serviceType,
        city: serviceType === "mobile" ? city : null,
        transportFee,
        selectedDate: formatYMDLocal(slot.start),
        selectedTime,
        customerInfo,
        vehicleInfo,
        selectedServices,
        selectedAddons,
        selectedCar,
        totalPrice,
        notes: customerInfo.notes || "",
        startAtISO: slot.start.toISOString(),
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
      selectedTime,
      availableSlots,
      customerInfo,
      vehicleInfo,
      selectedServices,
      selectedAddons,
      selectedCar,
      totalPrice,
      effectiveDuration,
      durationSummary,
      formattedDurations,
      setBooking,
      navigate,
      serviceType,
      city,
      transportFee,
    ]
  );

  /* ---------- SKELETON ---------- */
  const slotsSkeleton = Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="h-10 rounded-md bg-[#121826] animate-pulse" />
  ));

  // ONLY showing updated return JSX + small UI tweaks
  // Your logic remains SAME (no breaking changes)

  return (
    <>
      <Title>Book Car Detailing | Precision</Title>
      <Meta
        name="description"
        content="Book your car detailing appointment quickly and securely with Precision Toronto."
      />

      <div className="min-h-screen flex flex-col text-white bg-gradient-to-b from-[#0A0F11] via-[#0D1418] to-[#101518] overflow-x-hidden">
        <Suspense fallback={null}>
          <FloatingContact />
        </Suspense>

        <Suspense fallback={<div className="h-2 bg-gray-800 animate-pulse" />}>
          <ProgressTracker currentStep={3} />
        </Suspense>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-1">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="w-fit rounded-lg px-4 py-2 bg-[#1A2234] hover:bg-[#223048]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <div className="">
              <h1 className="text-2xl md:text-3xl font-bold">
                Book Appointment
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {servicesSummary || "Selected services"} for{" "}
                <span className="text-blue-400 font-medium capitalize">
                  {selectedCar || "your vehicle"}
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SERVICE TYPE */}
            <Section title="Service Type" icon={<MapPin />}>
              <div className="space-y-4">
                {/* Toggle Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setServiceType("mobile")}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition",
                      serviceType === "mobile"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#1A2234] border-gray-700 hover:bg-[#223048]"
                    )}
                  >
                    🚗 Mobile Service
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType("dropoff")}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition",
                      serviceType === "dropoff"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#1A2234] border-gray-700 hover:bg-[#223048]"
                    )}
                  >
                    🏢 Drop-off Service
                  </button>
                </div>

                {/* MOBILE → CITY */}
                {serviceType === "mobile" && (
                  <div className="space-y-2">
                    <Label>Select Your City *</Label>

                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-lg bg-[#1A2234] border border-gray-700 focus:outline-none"
                    >
                      <option value="">Select city</option>

                      <optgroup label="Durham Region">
                        <option>Ajax</option>
                        <option>Pickering</option>
                        <option>Whitby</option>
                        <option>Oshawa</option>
                        <option>Clarington</option>
                      </optgroup>

                      <optgroup label="GTA">
                        <option>Toronto</option>
                        <option>Scarborough</option>
                        <option>Markham</option>
                        <option>Vaughan</option>
                        <option>Richmond Hill</option>
                        <option>Brampton</option>
                        <option>Mississauga</option>
                      </optgroup>
                    </select>

                    {isOutsideDurham && (
                      <p className="text-xs text-yellow-400">
                        ⚠️ Additional $25 transportation fee applies for your
                        area.
                      </p>
                    )}
                  </div>
                )}

                {/* DROPOFF → LOCATION */}
                {serviceType === "dropoff" && (
                  <div className="p-4 rounded-lg bg-[#1A2234] border border-gray-700">
                    <p className="text-sm text-gray-300">Drop-off Location:</p>
                    <p className="text-blue-400 font-semibold">
                      85 Gillett Dr, Ajax, ON
                    </p>
                  </div>
                )}
              </div>
            </Section>
            {/* DATE & TIME */}
            <Section title="Select Date & Time" icon={<CalendarIcon />}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DATE */}
                <div className="flex flex-col gap-2">
                  <Label>Preferred Date</Label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    className="w-full rounded-lg bg-[#1A2234] px-4 py-3 border border-gray-700 focus:outline-none"
                    placeholderText="Pick a date"
                  />
                  <span className="text-xs text-gray-400">
                    Duration:{" "}
                    <span className="text-blue-400">
                      {Math.round(effectiveDuration)} min
                    </span>
                  </span>
                </div>

                {/* TIME */}
                <div className="">
                  <Label>Preferred Time</Label>

                  <div className=" text-sm">
                    {loadingSlots && (
                      <span className="text-blue-400">Loading...</span>
                    )}
                    {slotsError && (
                      <span className="text-red-400">{slotsError}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {loadingSlots
                      ? slotsSkeleton
                      : availableSlots.map((slot) => (
                          <button
                            key={slot.label}
                            type="button"
                            disabled={slot.booked}
                            onClick={() =>
                              !slot.booked && setSelectedTime(slot.label)
                            }
                            className={cn(
                              "px-3 py-2 lg:min-w-40  rounded-md text-sm border transition whitespace-nowrap",
                              slot.booked
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : selectedTime === slot.label
                                ? "bg-blue-500 border-blue-500"
                                : "bg-[#1A2234] border-gray-700 hover:bg-[#223048]"
                            )}
                          >
                            {slot.label}
                          </button>
                        ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* CUSTOMER */}
            <Section title="Customer Information" icon={<MapPin />}>
              <p className="pb-4">
                We collect this information to schedule your service,
                communicate updates, and maintain accurate service records for
                your vehicle.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="name"
                  label="Full Name *"
                  value={customerInfo.name}
                  onChange={(v) => setCustomerInfo((p) => ({ ...p, name: v }))}
                />
                <InputField
                  id="email"
                  type="email"
                  label="Email *"
                  value={customerInfo.email}
                  onChange={(v) => setCustomerInfo((p) => ({ ...p, email: v }))}
                />
                <InputField
                  id="phone"
                  label="Phone *"
                  value={customerInfo.phone}
                  onChange={(v) => setCustomerInfo((p) => ({ ...p, phone: v }))}
                />
                <InputField
                  id="address"
                  label="Address *"
                  value={customerInfo.address}
                  onChange={(v) =>
                    setCustomerInfo((p) => ({ ...p, address: v }))
                  }
                />
              </div>

              <div className="mt-4">
                <Label>Notes</Label>
                <Textarea
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="mt-2 bg-[#1A2234]"
                />
              </div>
            </Section>

            {/* VEHICLE */}
            <Section title="Vehicle Details" icon={<Clock />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  id="make"
                  label="Make *"
                  value={vehicleInfo.make}
                  onChange={(v) => setVehicleInfo((p) => ({ ...p, make: v }))}
                />
                <InputField
                  id="model"
                  label="Model *"
                  value={vehicleInfo.model}
                  onChange={(v) => setVehicleInfo((p) => ({ ...p, model: v }))}
                />
                <InputField
                  id="year"
                  label="Year *"
                  value={vehicleInfo.year}
                  onChange={(v) => setVehicleInfo((p) => ({ ...p, year: v }))}
                />
                <InputField
                  id="color"
                  label="Color"
                  value={vehicleInfo.color}
                  onChange={(v) => setVehicleInfo((p) => ({ ...p, color: v }))}
                />
                <InputField
                  id="license"
                  label="License"
                  value={vehicleInfo.license}
                  onChange={(v) =>
                    setVehicleInfo((p) => ({ ...p, license: v }))
                  }
                />
              </div>
            </Section>

            {/* SUMMARY */}
            <Section title="Summary">
              <div className="space-y-2 text-sm">
                <SummaryRow label="Services" value={servicesSummary} />
                <SummaryRow label="Vehicle" value={selectedCar} />
                <SummaryRow
                  label="Service Type"
                  value={serviceType === "mobile" ? "Mobile" : "Drop-off"}
                />

                {serviceType === "mobile" && city && (
                  <SummaryRow label="City" value={city} />
                )}

                {transportFee > 0 && (
                  <SummaryRow
                    label="Transport Fee"
                    value={`$${transportFee}`}
                    highlight
                  />
                )}
                {selectedDate && (
                  <SummaryRow
                    label="Date"
                    value={format(selectedDate, "MMM dd")}
                    highlight
                  />
                )}
                {selectedTime && (
                  <SummaryRow label="Time" value={selectedTime} highlight />
                )}
                <SummaryRow
                  label="Duration"
                  value={`${Math.round(effectiveDuration)} min`}
                />

                <div className="flex justify-between pt-3 border-t border-gray-700 text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-400">
                    ${Number((totalPrice || 0) + transportFee).toFixed(2)}
                  </span>
                </div>
              </div>
            </Section>

            {/* CTA */}
            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full py-3 text-base rounded-lg bg-gradient-to-r from-blue-500 to-blue-700"
            >
              Continue to Confirmation
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

const Section = ({ title, icon, children }) => (
  <section className="bg-[#111827] rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
      {icon && <span className="text-blue-400">{icon}</span>}
      {title}
    </h3>
    {children}
  </section>
);
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
