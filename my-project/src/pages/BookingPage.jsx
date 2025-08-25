import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
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

const BookingPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return <div className="p-10 text-center">No booking data found.</div>;
  }

  const { selectedCar, selectedServices, selectedAddons, totalPrice } = state;

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
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

  const timeSlots = [
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
    console.log("Booking Data:", bookingData);
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

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col text-white">
      <Header />
      <ProgressTracker currentStep={3} />

      <div className="container mx-auto px-6 py-12 flex-1">
        {/* Back & Title */}
        <div className="flex items-center gap-4 mb-12">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-xl px-5 py-2 shadow-md bg-[#1A2234] hover:bg-[#223048] transition-all text-blue-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Book Your Appointment
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              {selectedServices.map((s) => s.title).join(", ")} for{" "}
              <span className="capitalize font-medium text-blue-400">
                {selectedCar}
              </span>
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Date & Time */}
            <div className="bg-[#111827] p-8 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all">
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
                        className={cn(
                          "w-full justify-start text-left font-normal mt-3 rounded-xl py-3 shadow-md bg-[#1A2234] hover:bg-[#223048] text-white",
                          !selectedDate && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl shadow-lg bg-[#1A2234] border border-blue-500/30">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-4 rounded-xl bg-[#111827] text-white [&_.rdp-day_selected]:bg-blue-500 [&_.rdp-day_selected]:text-white [&_.rdp-day:hover]:bg-blue-600/40"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="time">Preferred Time</Label>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "rounded-lg py-2 transition-all shadow-sm",
                          selectedTime === time
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-[#1A2234] hover:bg-[#223048] text-gray-200"
                        )}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-[#111827] p-8 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Customer Information
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                      setCustomerInfo({ ...customerInfo, email: e.target.value })
                    }
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                      setCustomerInfo({ ...customerInfo, phone: e.target.value })
                    }
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                  className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
                  placeholder="Any special instructions..."
                />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-[#111827] p-8 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all">
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
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
                    className="mt-2 rounded-lg shadow-sm bg-[#1A2234] text-white"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#111827] p-8 rounded-2xl shadow-xl hover:shadow-blue-500/20 transition-all">
              <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Services:</span>
                  <span className="font-semibold">
                    {selectedServices.map((s) => s.title).join(", ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle:</span>
                  <span className="font-semibold capitalize">{selectedCar}</span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-semibold text-blue-400">
                      {format(selectedDate, "PPP")}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-semibold text-blue-400">
                      {selectedTime}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-4">
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
              disabled={!isFormValid}
              className="w-full py-4 text-lg rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Confirmation
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
