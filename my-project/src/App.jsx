import React, { useState, useEffect, Suspense, lazy, memo } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Meta } from "react-head";

// ✅ Lazy-loaded pages (code-splitting)
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Gallery = lazy(() => import("./pages/GalleryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// ✅ Scroll Reset (memoized)
const ScrollToTop = memo(() => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
});

function App() {
  const [selectedCar, setSelectedCar] = useState(null);

  return (
    <>
      {/* Global SEO / Meta */}
      <Meta charSet="utf-8" />
      <Meta name="viewport" content="width=device-width, initial-scale=1" />

      <ScrollToTop />

      {/* Suspense fallback for lazy-loaded pages */}
      <Suspense
        fallback={<div className="flex justify-center p-10">Loading...</div>}
      >
        <Routes>
          <Route path="/" element={<HomePage onCarSelect={setSelectedCar} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<Gallery />} />
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
