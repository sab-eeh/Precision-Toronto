import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  memo,
  useCallback,
} from "react";
import { Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Lazy-loaded pages
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// ✅ Prefetch helper map
const prefetchMap = {
  "/": () => import("./pages/HomePage"),
  "/about": () => import("./pages/AboutPage"),
  "/connect": () => import("./pages/GalleryPage"),
  "/contact": () => import("./pages/ContactPage"),
  "/services": () => import("./pages/ServicesPage"),
  "/booking": () => import("./pages/BookingPage"),
  "/confirmation": () => import("./pages/ConfirmationPage"),
  "/admin/login": () => import("./pages/AdminLogin"),
  "/admin/dashboard": () => import("./pages/AdminDashboard"),
};

// ✅ Custom Link with prefetching
const PrefetchLink = ({ to, children, ...props }) => {
  const handlePrefetch = useCallback(() => {
    if (prefetchMap[to]) prefetchMap[to]();
  }, [to]);

  return (
    <Link
      to={to}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      {...props}
    >
      {children}
    </Link>
  );
};

// ✅ Scroll Reset
const ScrollToTop = memo(() => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
});

// ✅ Minimal Loader (not blocking full screen)
const Loader = memo(() => (
  <div className="flex justify-center items-center h-32">
    <motion.div
      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  </div>
));

// ✅ Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0.5, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  const [selectedCar, setSelectedCar] = useState(null);
  const location = useLocation();

  // ✅ Preload idle routes (after homepage load)
  useEffect(() => {
    const timer = setTimeout(() => {
      ["/about", "/services", "/contact"].forEach((path) => {
        if (prefetchMap[path]) prefetchMap[path]();
      });
    }, 2000); // preload in background
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <HomePage onCarSelect={setSelectedCar} />
                </PageWrapper>
              }
            />
            <Route
              path="/about"
              element={
                <PageWrapper>
                  <AboutPage />
                </PageWrapper>
              }
            />
            <Route
              path="/connect"
              element={
                <PageWrapper>
                  <GalleryPage />
                </PageWrapper>
              }
            />
            <Route
              path="/contact"
              element={
                <PageWrapper>
                  <ContactPage />
                </PageWrapper>
              }
            />
            <Route
              path="/services"
              element={
                <PageWrapper>
                  <ServicesPage selectedCar={selectedCar} />
                </PageWrapper>
              }
            />
            <Route
              path="/booking"
              element={
                <PageWrapper>
                  <BookingPage selectedCar={selectedCar} />
                </PageWrapper>
              }
            />
            <Route
              path="/confirmation"
              element={
                <PageWrapper>
                  <ConfirmationPage />
                </PageWrapper>
              }
            />
            <Route
              path="/admin/login"
              element={
                <PageWrapper>
                  <AdminLogin />
                </PageWrapper>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PageWrapper>
                  <AdminDashboard />
                </PageWrapper>
              }
            />

            {/* ✅ Fix wrong route (/connect -> /gallery) */}
            <Route path="/connect" element={<Navigate to="/gallery" />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default App;
export { PrefetchLink };
