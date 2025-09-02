import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
// NOTE: keep your original path/name if your component lives at `calender`
import { Calendar } from "../components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import ProgressTracker from "../components/ProgressTracker";
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
import { api } from "../api/client";

const BUSINESS_MINUTES_PER_SLOT = 60; // Keep in sync with backend generateSlotsForDay

function toYMD(date) {
  // yyyy-mm-dd for API
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return <div className="p-10 text-center">No booking data found.</div>;
  }

  const { selectedCar, selectedServices, selectedAddons, totalPrice } = state;

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    license: "",
  });

  // Fetch availability whenever date changes
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
        // backend returns: { success, availableSlots: [{start, end}] }
        const slots = (data?.availableSlots || []).map((s) => ({
          start: new Date(s.start),
          end: new Date(s.end),
          label: format(new Date(s.start), "h:mm a"),
        }));
        setAvailableSlots(slots);
      } catch (err) {
        setSlotsError(err.message || "Failed to load availability");
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [selectedDate]);

  // On submit → go to confirmation page with full state
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    const selectedSlot = availableSlots.find((s) => s.label === selectedTime);
    if (!selectedSlot) return;

    // Pass everything to confirmation page
    const bookingData = {
      selectedDate,
      selectedTime, // "h:mm a"
      customerInfo,
      vehicleInfo,
      selectedServices,
      selectedAddons,
      selectedCar,
      totalPrice,
      notes: customerInfo.notes,
      startAtISO: selectedSlot.start.toISOString(), // helpful for payload
      slotMinutes: BUSINESS_MINUTES_PER_SLOT,
    };
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
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col text-white">
      <Header />
      <ProgressTracker currentStep={3} />

      <div className="container mx-auto px-6 py-12 flex-1">
        {/* Back & Title */}
        <div className="flex items-center gap-4 mb-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-lg px-4 py-2 bg-[#1A2234] hover:bg-[#223048] text-blue-400"
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

        <div className="max-w-4xl mx-auto space-y-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Date & Time */}
            <div className="bg-[#111827] p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" /> Select Date &
                Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-3 rounded-lg py-3 bg-[#1A2234] hover:bg-[#223048] text-white",
                          !selectedDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-lg bg-[#1A2234] border border-blue-500/20">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today; // no past dates
                        }}
                        initialFocus
                        className="p-3 rounded-lg bg-[#111827] text-white [&_.rdp-day_selected]:bg-blue-500 [&_.rdp-day_selected]:text-white [&_.rdp-day:hover]:bg-blue-600/40"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time">Preferred Time</Label>

                  {/* Availability states */}
                  {loadingSlots && (
                    <div className="mt-3 text-sm text-blue-300">
                      Loading available slots…
                    </div>
                  )}
                  {slotsError && (
                    <div className="mt-3 text-sm text-red-400">
                      {slotsError}
                    </div>
                  )}
                  {!loadingSlots &&
                    selectedDate &&
                    availableSlots.length === 0 && (
                      <div className="mt-3 text-sm text-yellow-300">
                        No slots available for the selected date.
                      </div>
                    )}

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.label}
                        type="button"
                        variant={
                          selectedTime === slot.label ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedTime(slot.label)}
                        className={cn(
                          "rounded-md py-2",
                          selectedTime === slot.label
                            ? "bg-blue-500 text-white"
                            : "bg-[#1A2234] hover:bg-[#223048] text-gray-200"
                        )}
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-[#111827] p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Customer
                Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Service Address *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: e.target.value,
                      })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, notes: e.target.value })
                  }
                  className="mt-2 rounded-md bg-[#1A2234] text-white"
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-[#111827] p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Vehicle Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={vehicleInfo.make}
                    onChange={(e) =>
                      setVehicleInfo({ ...vehicleInfo, make: e.target.value })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={vehicleInfo.model}
                    onChange={(e) =>
                      setVehicleInfo({ ...vehicleInfo, model: e.target.value })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={vehicleInfo.year}
                    onChange={(e) =>
                      setVehicleInfo({ ...vehicleInfo, year: e.target.value })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={vehicleInfo.color}
                    onChange={(e) =>
                      setVehicleInfo({ ...vehicleInfo, color: e.target.value })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="license">License Plate</Label>
                  <Input
                    id="license"
                    value={vehicleInfo.license}
                    onChange={(e) =>
                      setVehicleInfo({
                        ...vehicleInfo,
                        license: e.target.value,
                      })
                    }
                    className="mt-2 rounded-md bg-[#1A2234] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#111827] p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Services:</span>
                  <span className="font-medium">{servicesSummary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle:</span>
                  <span className="capitalize">{selectedCar}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-blue-400">
                      {format(selectedDate, "PPP")}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-blue-400">{selectedTime}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-blue-400">
                    ${totalPrice}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || submitting}
              className="w-full py-4 text-lg rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onSubmit={() => setSubmitting(true)}
            >
              Continue to Confirmation
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
