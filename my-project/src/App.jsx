import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  memo,
  useCallback,
  useMemo,
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

/* -------------------- Prefetching <Link> -------------------- */
const PrefetchLink = memo(function PrefetchLink({ to, children, ...props }) {
  const handlePrefetch = useCallback(() => {
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isSlow =
      conn?.saveData || /(^|-)2g$/i.test(conn?.effectiveType || "");
    if (!isSlow && PREFETCH_MAP[to]) PREFETCH_MAP[to]();
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
    // keep behavior immediate but standards-compliant
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
});

/* -------------------- Loader (non-blocking footprint) -------------------- */
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
  initial: { opacity: 0.5, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: "easeOut" },
});

const PageWrapper = memo(function PageWrapper({ children }) {
  // memoize variants object reference
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
function App() {
  const [selectedCar, setSelectedCar] = useState(null);
  const location = useLocation();

  // Idle preloading of common routes – connection-aware
  useEffect(() => {
    const conn =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const isSlow =
      conn?.saveData || /(^|-)2g$/i.test(conn?.effectiveType || "");

    if (isSlow) return;

    const preload = () => {
      ["/about", "/services", "/contact"].forEach((p) => {
        const fn = PREFETCH_MAP[p];
        if (fn) fn();
      });
    };

    // Use requestIdleCallback if available for zero-jank background work
    const id =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(preload, { timeout: 2000 })
        : setTimeout(preload, 2000);

    return () => {
      if (typeof id === "number") clearTimeout(id);
      else if ("cancelIdleCallback" in window) window.cancelIdleCallback(id);
    };
  }, []);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        {/* initial={false} avoids exit/enter flicker on first mount */}
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

            {/* Redirects / legacy paths */}
            <Route
              path="/connect"
              element={<Navigate to="/gallery" replace />}
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </>
  );
}

export default App;
export { PrefetchLink };
