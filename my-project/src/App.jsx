import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ServicesPage from "./pages/ServicesPage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import { useEffect } from "react";

// ✅ Global scroll reset
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // always reset scroll when changing route
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [selectedCar, setSelectedCar] = useState(null);

  return (
    <>
      {/* scroll reset works for forward + back */}
      <ScrollToTop />

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
    </>
  );
}

export default App;
