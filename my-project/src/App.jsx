import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  memo,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ===== Layout ===== */
import Header from "./layout/Header";
import Footer from "./layout/Footer";

/* ===== Lazy Pages ===== */
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

/* ===== Error Boundary ===== */
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center text-white bg-black">
          Something went wrong. Please refresh.
        </div>
      );
    }
    return this.props.children;
  }
}

/* ===== Prefetch ===== */
const PREFETCH_MAP = {
  "/services": () => import("./pages/ServicesPage"),
  "/booking": () => import("./pages/BookingPage"),
  "/about": () => import("./pages/AboutPage"),
};

const PrefetchLink = memo(({ to, children, ...props }) => {
  const done = useRef(false);

  const prefetch = useCallback(() => {
    if (done.current) return;
    const fn = PREFETCH_MAP[to];
    if (fn) {
      done.current = true;
      fn();
    }
  }, [to]);

  return (
    <Link to={to} onPointerEnter={prefetch} onFocus={prefetch} {...props}>
      {children}
    </Link>
  );
});

/* ===== Scroll Reset ===== */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

/* ===== Loader ===== */
const Loader = () => (
  <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
    <motion.div
      className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
    />
    <p className="text-gray-400 text-sm">Loading...</p>
  </div>
);

/* ===== Page Wrapper ===== */
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0.6, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="min-h-screen flex flex-col"
  >
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </motion.div>
);

/* ===== Protected Route ===== */
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("admin-auth") === "true";
  return isAuth ? children : <Navigate to="/admin/login" replace />;
};

/* ===== App ===== */
export default function App() {
  const location = useLocation();

  // ✅ Persist booking state
  const [selectedCar, setSelectedCar] = useState(() => {
    return localStorage.getItem("selectedCar") || null;
  });

  useEffect(() => {
    if (selectedCar) {
      localStorage.setItem("selectedCar", selectedCar);
    }
  }, [selectedCar]);

  // ✅ Smart prefetch (focus on conversion)
  useEffect(() => {
    const timer = setTimeout(() => {
      PREFETCH_MAP["/services"]?.();
      PREFETCH_MAP["/booking"]?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />

      <Suspense fallback={<Loader />}>
        <AnimatePresence mode="wait" initial={false}>
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

            {/* Admin */}
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
                <ProtectedRoute>
                  <PageWrapper>
                    <AdminDashboard />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />

            {/* Redirect */}
            <Route path="/connect" element={<Navigate to="/gallery" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
}

export { PrefetchLink };
