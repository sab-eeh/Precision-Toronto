// src/App.jsx
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

/* -------------------- Lazy-loaded pages (named chunks) -------------------- */
const HomePage = lazy(() =>
  import(
    /* webpackChunkName: "home", webpackPrefetch: true */ "./pages/HomePage"
  )
);
const AboutPage = lazy(() =>
  import(/* webpackChunkName: "about" */ "./pages/AboutPage")
);
const GalleryPage = lazy(() =>
  import(/* webpackChunkName: "gallery" */ "./pages/GalleryPage")
);
const ContactPage = lazy(() =>
  import(/* webpackChunkName: "contact" */ "./pages/ContactPage")
);
const ServicesPage = lazy(() =>
  import(/* webpackChunkName: "services" */ "./pages/ServicesPage")
);
const BookingPage = lazy(() =>
  import(/* webpackChunkName: "booking" */ "./pages/BookingPage")
);
const ConfirmationPage = lazy(() =>
  import(/* webpackChunkName: "confirmation" */ "./pages/ConfirmationPage")
);
const AdminLogin = lazy(() =>
  import(/* webpackChunkName: "admin-login" */ "./pages/AdminLogin")
);
const AdminDashboard = lazy(() =>
  import(/* webpackChunkName: "admin-dashboard" */ "./pages/AdminDashboard")
);

/* -------------------- Prefetch helpers -------------------- */
const PREFETCH_MAP = Object.freeze({
  "/": () => import(/* webpackChunkName: "home" */ "./pages/HomePage"),
  "/about": () => import(/* webpackChunkName: "about" */ "./pages/AboutPage"),
  "/gallery": () =>
    import(/* webpackChunkName: "gallery" */ "./pages/GalleryPage"),
  "/contact": () =>
    import(/* webpackChunkName: "contact" */ "./pages/ContactPage"),
  "/services": () =>
    import(/* webpackChunkName: "services" */ "./pages/ServicesPage"),
  "/booking": () =>
    import(/* webpackChunkName: "booking" */ "./pages/BookingPage"),
  "/confirmation": () =>
    import(/* webpackChunkName: "confirmation" */ "./pages/ConfirmationPage"),
  "/admin/login": () =>
    import(/* webpackChunkName: "admin-login" */ "./pages/AdminLogin"),
  "/admin/dashboard": () =>
    import(/* webpackChunkName: "admin-dashboard" */ "./pages/AdminDashboard"),
});

function isSlowConnection() {
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const effectiveType = conn?.effectiveType || "";
  const slow =
    conn?.saveData ||
    /(2g|slow-2g)/i.test(effectiveType) ||
    /(^|-)2g$/i.test(effectiveType);

  return !!slow;
}

function requestIdle(cb, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    return window.requestIdleCallback(cb, { timeout });
  }
  return window.setTimeout(cb, Math.min(timeout, 1200));
}

function cancelIdle(id) {
  if (typeof id === "number") clearTimeout(id);
  else if ("cancelIdleCallback" in window) window.cancelIdleCallback(id);
}

/* -------------------- Prefetching <Link> (safe + once) -------------------- */
const PrefetchLink = memo(function PrefetchLink({ to, children, ...props }) {
  const prefetchedRef = useRef(false);

  const handlePrefetch = useCallback(() => {
    if (prefetchedRef.current) return;
    if (isSlowConnection()) return;

    const fn = PREFETCH_MAP[to];
    if (fn) {
      prefetchedRef.current = true;
      fn();
    }
  }, [to]);

  return (
    <Link
      to={to}
      onPointerEnter={handlePrefetch}
      onFocus={handlePrefetch}
      {...props}
    >
      {children}
    </Link>
  );
});

/* -------------------- Scroll reset -------------------- */
const ScrollToTop = memo(function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
});

/* -------------------- Loader -------------------- */
const Loader = memo(function Loader() {
  return (
    <div className="flex justify-center items-center h-32">
      <motion.div
        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </div>
  );
});

/* -------------------- Page transition wrapper -------------------- */
const PAGE_TRANSITION = Object.freeze({
  initial: { opacity: 0.6, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: "easeOut" },
});

const PageWrapper = memo(function PageWrapper({ children }) {
  const anim = useMemo(() => PAGE_TRANSITION, []);
  return (
    <motion.div
      initial={anim.initial}
      animate={anim.animate}
      exit={anim.exit}
      transition={anim.transition}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
});

/* -------------------- App -------------------- */
export default function App() {
  const [selectedCar, setSelectedCar] = useState(null);
  const location = useLocation();

  // Prefetch common routes once, in idle time (smart + safe)
  useEffect(() => {
    if (isSlowConnection()) return;

    const id = requestIdle(() => {
      // Only prefetch routes user is MOST likely to visit
      ["/services", "/about", "/contact"].forEach((p) => {
        const fn = PREFETCH_MAP[p];
        if (fn) fn();
      });
    }, 2500);

    return () => cancelIdle(id);
  }, []);

  return (
    <>
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

            {/* Redirects / legacy */}
            <Route
              path="/connect"
              element={<Navigate to="/gallery" replace />}
            />

            {/* 404 fallback (important after hosting) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export { PrefetchLink };
