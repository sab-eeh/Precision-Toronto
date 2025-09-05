import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";

export function DatePickerInput({ value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value || null);

  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        {/* Calendar icon */}
        <Calendar className="absolute left-3 top-3 h-5 w-5 text-blue-400" />

        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            onChange?.(date); // notify parent (BookingPage) for time slots
          }}
          minDate={new Date()} // disable past dates
          placeholderText="Pick a date"
          dateFormat="MMM dd, yyyy"
          className="w-full bg-[#1A2234] border border-gray-700 text-white 
                     rounded-xl py-3 pl-10 pr-4 shadow-md 
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     placeholder-gray-400"
        />
      </div>
    </div>
  );
}
