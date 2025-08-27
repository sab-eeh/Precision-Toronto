import React, { useMemo, useState, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calender"; // keep your existing Calendar component
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import ProgressTracker from "../components/ProgressTracker";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

// simple cn helper in case it's not available in your project context
const cn = (...classes) => classes.filter(Boolean).join(" ");

const cardBase =
  "bg-[#0D1320] border border-white/5 rounded-2xl shadow-xl shadow-black/20 backdrop-blur supports-[backdrop-filter]:bg-[#0D1320]/80";
const sectionHeading = "text-xl font-semibold mb-6 flex items-center gap-2";

// Pre-declare constant time slots to avoid re-creating each render
const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0F1C] text-white p-10">
        <div className={cn(cardBase, "p-8 text-center w-full max-w-xl")}>No booking data found.</div>
      </div>
    );
  }

  const { selectedCar, selectedServices, selectedAddons, totalPrice } = state;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "", // general instructions (entrance codes, pets, etc.)
  });

  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    license: "",
    cautions: "", // explicit car cautions (e.g., extremely dirty, delicate paint, exotic car)
  });

  const isFormValid = useMemo(() => {
    return (
      !!selectedDate &&
      !!selectedTime &&
      customerInfo.name.trim() &&
      customerInfo.email.trim() &&
      customerInfo.phone.trim() &&
      customerInfo.address.trim() &&
      vehicleInfo.make.trim() &&
      vehicleInfo.model.trim() &&
      vehicleInfo.year.toString().trim()
    );
  }, [selectedDate, selectedTime, customerInfo, vehicleInfo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = {
      date: selectedDate,
      time: selectedTime,
      customer: customerInfo,
      vehicle: vehicleInfo,
      services: selectedServices,
      addons: selectedAddons,
      carType: selectedCar,
      total: totalPrice,
    };
    navigate("/confirmation", { state: bookingData });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const chip = (active) =>
    cn(
      "rounded-lg py-2 px-3 text-sm border transition-all",
      active
        ? "bg-blue-500/90 text-white border-blue-500"
        : "bg-[#121A2A] text-gray-200 hover:bg-[#182236] border-white/10"
    );

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex flex-col">
      <Header />

      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#070B14] via-[#070B14]/95 to-transparent backdrop-blur border-b border-white/5">
        <ProgressTracker currentStep={3} />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1"
      >
        {/* Back & Title */}
        <div className="flex flex-wrap items-center gap-4 mb-8 lg:mb-12">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-xl px-5 py-2 bg-[#0F1524] hover:bg-[#121C33] transition-all text-blue-300 border-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex-1 min-w-[240px]">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Book Your Appointment</h1>
            <p className="text-gray-400 mt-2 text-sm">
              {selectedServices.map((s) => s.title).join(", ")} for{" "}
              <span className="capitalize font-medium text-blue-300">{selectedCar}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 lg:space-y-10">
          {/* Date & Time */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className={cn(cardBase, "p-5 sm:p-6 lg:p-8")}
          >
            <h3 className={sectionHeading}>
              <CalendarIcon className="w-5 h-5 text-blue-300" /> Select Date & Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Date Picker */}
              <div>
                <Label htmlFor="date">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-3 rounded-xl py-3 bg-[#0F1627] hover:bg-[#121C33] text-white border-white/10",
                        !selectedDate && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-300" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className={cn(
                      "w-auto p-0 rounded-2xl border border-white/10 shadow-2xl bg-[#0B1120]"
                    )}
                  >
                    {/* Calendar with custom theming (no yellow tones) */}
                    <div className="p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today; // disable past days
                        }}
                        initialFocus
                        className={cn(
                          "rdp text-white",
                          // base
                          "[&_.rdp-months]:gap-4 [&_.rdp-month]:space-y-3 [&_.rdp-caption_label]:text-base [&_.rdp-caption_label]:font-medium",
                          // header arrows
                          "[&_.rdp-nav_button]:h-8 [&_.rdp-nav_button]:w-8 [&_.rdp-nav_button]:rounded-lg [&_.rdp-nav_button]:bg-white/5 [&_.rdp-nav_button:hover]:bg-white/10",
                          // weekdays row
                          "[&_.rdp-head_cell]:text-[11px] [&_.rdp-head_cell]:uppercase [&_.rdp-head_cell]:tracking-wider [&_.rdp-head_cell]:text-gray-400",
                          // day cells
                          "[&_.rdp-cell]:p-0 [&_.rdp-day]:h-10 [&_.rdp-day]:w-10 [&_.rdp-day]:rounded-xl",
                          "[&_.rdp-day]:transition-colors [&_.rdp-day]:duration-200",
                          // states
                          "[&_.rdp-day:not(.rdp-day_selected):not(.rdp-day_outside)]:hover:bg-blue-500/20",
                          "[&_.rdp-day_today]:ring-1 [&_.rdp-day_today]:ring-blue-400/50",
                          "[&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white [&_.rdp-day_selected:hover]:bg-blue-500",
                          "[&_.rdp-day_disabled]:opacity-30 [&_.rdp-day_disabled]:cursor-not-allowed",
                        )}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-3">
                  {TIME_SLOTS.map((time, i) => (
                    <motion.button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={chip(selectedTime === time)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Customer Info */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className={cn(cardBase, "p-5 sm:p-6 lg:p-8")}
          >
            <h3 className={sectionHeading}>
              <MapPin className="w-5 h-5 text-blue-300" /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { key: "name", label: "Name" },
                { key: "email", label: "Email", type: "email" },
                { key: "phone", label: "Phone", pattern: "[0-9+\-() ]+" },
                { key: "address", label: "Address" },
              ].map(({ key, label, type, pattern }, i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Label htmlFor={key}>{label} *</Label>
                  <Input
                    id={key}
                    type={type || "text"}
                    inputMode={key === "phone" ? "tel" : undefined}
                    pattern={pattern}
                    value={customerInfo[key]}
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, [key]: e.target.value }))}
                    className="mt-2 rounded-xl bg-[#0F1627] border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo((p) => ({ ...p, notes: e.target.value }))}
                className="mt-2 rounded-xl bg-[#0F1627] border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Parking details, gate code, pets, etc."
                rows={4}
              />
            </div>
          </motion.section>

          {/* Vehicle Info */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className={cn(cardBase, "p-5 sm:p-6 lg:p-8")}
          >
            <h3 className={sectionHeading}>
              <Clock className="w-5 h-5 text-blue-300" /> Vehicle Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { key: "make", label: "Make", required: true },
                { key: "model", label: "Model", required: true },
                { key: "year", label: "Year", required: true, inputMode: "numeric", pattern: "[0-9]{4}" },
                { key: "color", label: "Color" },
                { key: "license", label: "License Plate" },
              ].map(({ key, label, required, inputMode, pattern }, i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Label htmlFor={key}>{label}{required ? " *" : ""}</Label>
                  <Input
                    id={key}
                    inputMode={inputMode}
                    pattern={pattern}
                    value={vehicleInfo[key]}
                    onChange={(e) => setVehicleInfo((p) => ({ ...p, [key]: e.target.value }))}
                    className="mt-2 rounded-xl bg-[#0F1627] border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                    required={required}
                  />
                </motion.div>
              ))}
            </div>

            {/* Vehicle cautions / notes explicitly requested */}
            <div className="mt-6">
              <Label htmlFor="cautions">Vehicle Notes & Cautions</Label>
              <Textarea
                id="cautions"
                value={vehicleInfo.cautions}
                onChange={(e) => setVehicleInfo((p) => ({ ...p, cautions: e.target.value }))}
                className="mt-2 rounded-xl bg-[#0F1627] border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., extremely dirty, delicate paint, ceramic coated, very expensive/exotic car, aftermarket parts, child seats inside, etc."
                rows={4}
              />
            </div>
          </motion.section>

          {/* Summary */}
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className={cn(cardBase, "p-5 sm:p-6 lg:p-8")}
          >
            <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">Services:</span>
                  <span className="font-medium text-right line-clamp-2">
                    {selectedServices.map((s) => s.title).join(", ")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-400">Vehicle:</span>
                  <span className="font-medium capitalize">{selectedCar}</span>
                </div>

                {selectedDate && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-semibold text-blue-300">{format(selectedDate, "PPP")}</span>
                  </div>
                )}

                {selectedTime && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-semibold text-blue-300">{selectedTime}</span>
                  </div>
                )}

                {customerInfo.notes && (
                  <div className="mt-2">
                    <span className="block text-gray-400 mb-1">Special Instructions:</span>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{customerInfo.notes}</p>
                  </div>
                )}

                {vehicleInfo.cautions && (
                  <div className="mt-2">
                    <span className="block text-gray-400 mb-1">Vehicle Notes & Cautions:</span>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{vehicleInfo.cautions}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/[0.03] p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-base">Subtotal</span>
                  <span className="font-semibold">${totalPrice.toFixed ? totalPrice.toFixed(2) : totalPrice}</span>
                </div>
                {selectedAddons?.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Add-ons: {selectedAddons.map((a) => a.title ?? a).join(", ")}
                  </div>
                )}
                <div className="h-px my-4 bg-white/10" />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-blue-300">${totalPrice}</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Submit */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid}
              className={cn(
                "w-full py-4 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-95 transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Continue to Confirmation
            </Button>
            {!isFormValid && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                Please complete all required fields to continue.
              </p>
            )}
          </motion.div>
        </form>
      </motion.main>

      <Footer />
    </div>
  );
}
