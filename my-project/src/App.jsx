import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  memo,
  useCallback,
} from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { Meta } from "react-head";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Lazy-loaded pages
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

// ✅ Prefetch helper map
const prefetchMap = {
  "/": () => import("./pages/HomePage"),
  "/about": () => import("./pages/AboutPage"),
  "/gallery": () => import("./pages/GalleryPage"),
  "/contact": () => import("./pages/ContactPage"),
  "/services": () => import("./pages/ServicesPage"),
  "/booking": () => import("./pages/BookingPage"),
  "/confirmation": () => import("./pages/ConfirmationPage"),
  "/admin/login": () => import("./pages/AdminLogin"),
  "/admin/dashboard": () => import("./pages/AdminDashboard"),
  "/admin/forgot-password": () => import("./pages/ForgotPassword"),
  "/admin/reset-password": () => import("./pages/ResetPassword"),
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
});

// ✅ Loader
const Loader = memo(() => (
  <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
    <motion.div
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  </div>
));

// ✅ Page transition
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.35, ease: "easeInOut" }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  const [selectedCar, setSelectedCar] = useState(null);
  const location = useLocation();

  return (
    <>
      {/* Global SEO */}
      <Meta charSet="utf-8" />
      <Meta name="viewport" content="width=device-width, initial-scale=1" />

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
              path="/gallery"
              element={
                <PageWrapper>
                  <Gallery />
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
            <Route
              path="/admin/forgot-password"
              element={
                <PageWrapper>
                  <ForgotPassword />
                </PageWrapper>
              }
            />
            <Route
              path="/admin/reset-password"
              element={
                <PageWrapper>
                  <ResetPassword />
                </PageWrapper>
              }
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default App;
export { PrefetchLink };
