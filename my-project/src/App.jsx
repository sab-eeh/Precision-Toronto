import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";

function App() {
  const [selectedCar, setSelectedCar] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<HomePage onCarSelect={setSelectedCar} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/services"
        element={<ServicesPage selectedCar={selectedCar} />}
      />
      <Route
        path="/booking"
        element={<BookingPage selectedCar={selectedCar} />}
      />
      <Route path="/confirmation" element={<ConfirmationPage />} />
    </Routes>
  );
}

export default App;
