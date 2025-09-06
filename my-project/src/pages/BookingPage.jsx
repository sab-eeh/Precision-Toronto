import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import ProgressTracker from "../components/ProgressTracker";
import FloatingContact from "../components/FloatingContact";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
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

const BUSINESS_MINUTES_PER_SLOT = 60;

function toYMD(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { booking, setBooking } = useContext(BookingContext);

  if (!state && !booking.services?.length) {
    return <div className="p-10 text-center">No booking data found.</div>;
  }

  const { selectedCar, selectedServices, selectedAddons, totalPrice } =
    state || booking;

  const [selectedDate, setSelectedDate] = useState(
    booking.selectedDate || null
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(booking.selectedTime || "");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [customerInfo, setCustomerInfo] = useState(
    booking.customerInfo || {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    }
  );

  const [vehicleInfo, setVehicleInfo] = useState(
    booking.vehicleInfo || {
      make: "",
      model: "",
      year: "",
      color: "",
      license: "",
    }
  );

  // Restore booking draft
  useEffect(() => {
    const saved = localStorage.getItem("precision_booking_draft_v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedDate(
        parsed.selectedDate ? new Date(parsed.selectedDate) : null
      );
      setSelectedTime(parsed.selectedTime || "");
      setCustomerInfo(parsed.customerInfo || {});
      setVehicleInfo(parsed.vehicleInfo || {});
    }
  }, []);

  // Sync draft
  useEffect(() => {
    const draft = { selectedDate, selectedTime, customerInfo, vehicleInfo };
    localStorage.setItem("precision_booking_draft_v1", JSON.stringify(draft));
  }, [selectedDate, selectedTime, customerInfo, vehicleInfo]);

  // Fetch slots
  useEffect(() => {
    (async () => {
      setSlotsError("");
      setAvailableSlots([]);
      setSelectedTime("");
      if (!selectedDate) return;

      try {
        setLoadingSlots(true);
        const ymd = toYMD(selectedDate);
        const data = await api(`/api/bookings/availability?date=${ymd}`);
        // Expect API to return: { availableSlots: [{start, end, label, booked: true/false}] }
        const slots = (data?.availableSlots || []).map((s) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          label: format(new Date(s.start), "h:mm a"),
          booked: s.booked || false,
        }));
        setAvailableSlots(slots);
      } catch (err) {
        setSlotsError(err.message || "Failed to load availability");
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    const selectedSlot = availableSlots.find((s) => s.label === selectedTime);
    if (!selectedSlot) return;

    const bookingData = {
      selectedDate,
      selectedTime,
      customerInfo,
      vehicleInfo,
      selectedServices,
      selectedAddons,
      selectedCar,
      totalPrice,
      notes: customerInfo.notes,
      startAtISO: selectedSlot.start.toISOString(),
      slotMinutes: BUSINESS_MINUTES_PER_SLOT,
    };

    setBooking((prev) => ({ ...prev, ...bookingData }));
    setSubmitting(true);
    navigate("/confirmation", { state: bookingData });
  };

  const isFormValid =
    selectedDate &&
    selectedTime &&
    customerInfo.name &&
    customerInfo.email &&
    customerInfo.phone &&
    customerInfo.address &&
    vehicleInfo.make &&
    vehicleInfo.model &&
    vehicleInfo.year;

  const servicesSummary = useMemo(
    () => selectedServices.map((s) => s.title).join(", "),
    [selectedServices]
  );

  return (
    <>
      <Title>Book Car Detailing in Toronto | Precision Toronto</Title>
      <Meta
        name="description"
        content="Book your car cleaning and detailing appointment with Precision Toronto."
      />
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col text-white">
        <Header />
        <FloatingContact />
        <ProgressTracker currentStep={3} />

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
                {servicesSummary} for{" "}
                <span className="capitalize font-medium text-blue-400">
                  {selectedCar}
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
                    />
                  </div>

                  <div>
                    <Label>Preferred Time</Label>
                    {loadingSlots && (
                      <p className="mt-3 text-sm text-blue-300">
                        Loading slots…
                      </p>
                    )}
                    {slotsError && (
                      <p className="mt-3 text-sm text-red-400">{slotsError}</p>
                    )}
                    {!loadingSlots &&
                      selectedDate &&
                      availableSlots.length === 0 && (
                        <p className="mt-3 text-sm text-yellow-300">
                          No slots available for this date.
                        </p>
                      )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.label}
                          type="button"
                          variant={
                            selectedTime === slot.label ? "default" : "outline"
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
                      setCustomerInfo({ ...customerInfo, name: val })
                    }
                    required
                  />
                  <InputField
                    id="email"
                    type="email"
                    label="Email Address *"
                    value={customerInfo.email}
                    onChange={(val) =>
                      setCustomerInfo({ ...customerInfo, email: val })
                    }
                    required
                  />
                  <InputField
                    id="phone"
                    type="tel"
                    label="Phone Number *"
                    value={customerInfo.phone}
                    onChange={(val) =>
                      setCustomerInfo({ ...customerInfo, phone: val })
                    }
                    required
                  />
                  <InputField
                    id="address"
                    label="Service Address *"
                    value={customerInfo.address}
                    onChange={(val) =>
                      setCustomerInfo({ ...customerInfo, address: val })
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
                      setCustomerInfo({
                        ...customerInfo,
                        notes: e.target.value,
                      })
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
                      setVehicleInfo({ ...vehicleInfo, make: val })
                    }
                    required
                  />
                  <InputField
                    id="model"
                    label="Model *"
                    value={vehicleInfo.model}
                    onChange={(val) =>
                      setVehicleInfo({ ...vehicleInfo, model: val })
                    }
                    required
                  />
                  <InputField
                    id="year"
                    label="Year *"
                    value={vehicleInfo.year}
                    onChange={(val) =>
                      setVehicleInfo({ ...vehicleInfo, year: val })
                    }
                    required
                  />
                  <InputField
                    id="color"
                    label="Color"
                    value={vehicleInfo.color}
                    onChange={(val) =>
                      setVehicleInfo({ ...vehicleInfo, color: val })
                    }
                  />
                  <InputField
                    id="license"
                    label="License Plate"
                    value={vehicleInfo.license}
                    onChange={(val) =>
                      setVehicleInfo({ ...vehicleInfo, license: val })
                    }
                  />
                </div>
              </section>

              {/* Summary */}
              <section className="bg-[#111827] p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <SummaryRow label="Services:" value={servicesSummary} />
                  <SummaryRow label="Vehicle:" value={selectedCar} />
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
                      ${totalPrice}
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
        <Footer />
      </div>
    </>
  );
}

function InputField({
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 rounded-md bg-[#1A2234] text-white"
        required={required}
      />
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={highlight ? "text-blue-400" : "capitalize"}>
        {value}
      </span>
    </div>
  );
}
