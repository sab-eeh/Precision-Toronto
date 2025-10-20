// src/pages/HomePage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
  useContext,
  memo,
  useRef,
} from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BookingContext } from "../context/BookingContext";

// ---------- centralized assets (barrel file) ----------
import { heroBackground, beforeAfterPairs, logo } from "../assets/home";

// ---------- lazy heavy bits ----------
const CarModelViewer = lazy(() =>
  import(
    /* webpackChunkName: "car-model-viewer", webpackPrefetch: true */ "../components/ui/CarModelViewer"
  )
);
const ProgressTracker = lazy(() =>
  import(
    /* webpackChunkName: "progress-tracker" */ "../components/ProgressTracker"
  )
);
const BeforeAfterSlider = lazy(() =>
  import(
    /* webpackChunkName: "before-after-slider" */ "../components/BeforeAfterSlider"
  )
);
const FloatingContact = lazy(() =>
  import(
    /* webpackChunkName: "floating-contact" */ "../components/FloatingContact"
  )
);
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));
const ReviewsCarousel = lazy(() => import("../components/ReviewsCarousel"));

// ---------- tiny skeleton ----------
const Skeleton = memo(function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
  );
});

// ---------- constants (memoized by module) ----------
const FEATURES = Object.freeze([
  {
    icon: Shield,
    title: "Premium Protection",
    description: "Protecting and maintaining your vehicle",
  },
  {
    icon: Clock,
    title: "Time Efficient",
    description: "Quick turnaround without compromising quality",
  },
  { icon: MapPin, title: "Mobile Service", description: "We come to you" },
  {
    icon: Star,
    title: "5-Star Reviews",
    description: "Trusted by 500+ satisfied customers",
  },
]);

const CARS = Object.freeze([
  {
    type: "sedan",
    label: "Sedan",
    desc: "Perfect for daily drivers",
    modelPath: "/models/sedan/scene.gltf",
  },
  {
    type: "suv",
    label: "SUV",
    desc: "Ideal for family vehicles",
    modelPath: "/models/suv/scene.gltf",
  },
  {
    type: "coupe",
    label: "Coupe",
    desc: "Luxury sports car treatment",
    modelPath: "/models/coupe/scene.gltf",
  },
  {
    type: "truck",
    label: "Truck",
    desc: "Heavy duty performance",
    modelPath: "/models/truck/scene.gltf",
  },
]);

// ---------- utilities ----------
const stagger = (i, base = 0.06) => ({ delay: i * base });
const clampIndex = (i, len) => (i + len) % len;

// observe once, disconnect as soon as seen
function useOnScreenOnce(ref, rootMargin = "0px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (seen || !ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [seen, ref, rootMargin]);
  return seen;
}

// ---------- small memoized UI ----------
const FeatureCard = memo(function FeatureCard({
  Icon,
  title,
  description,
  anim,
}) {
  return (
    <motion.div
      className="p-6 rounded-2xl bg-black/45 border border-white/10 shadow-md hover:shadow-blue-500/20 transition-all"
      {...anim}
      viewport={{ once: true }}
    >
      <Icon
        className="w-10 h-10 text-blue-400 mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 className="font-semibold text-sm md:text-base text-blue-400 uppercase tracking-wide">
        {title}
      </h3>
      <p className="mt-1 text-xs md:text-sm text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
});

const CarCard = memo(function CarCard({ car, onSelect, anim, fallback }) {
  const handleClick = useCallback(
    () => onSelect(car.type),
    [onSelect, car.type]
  );
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="text-left rounded-2xl p-5 bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-blue-400/20 hover:ring-2 hover:ring-cyan-400/30 transition"
      {...anim}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="h-56 flex items-center justify-center">
        <Suspense fallback={fallback}>
          <CarModelViewer
            modelPath={car.modelPath}
            modelType={car.type}
            quality="auto"
          />
        </Suspense>
      </div>
      <div className="text-center mt-5">
        <h3 className="text-lg font-semibold">{car.label}</h3>
        <p className="text-sm text-gray-400">{car.desc}</p>
      </div>
    </motion.button>
  );
});

const CarouselItem = memo(function CarouselItem({
  car,
  onSelect,
  anim,
  fallback,
}) {
  const handleClick = useCallback(
    () => onSelect(car.type),
    [onSelect, car.type]
  );
  return (
    <motion.button
      type="button"
      key={car.type}
      onClick={handleClick}
      className="text-left rounded-2xl p-6 bg-gradient-to-br from-[#1a1f23] to-[#101518] backdrop-blur-lg border border-white/10 shadow-xl transition"
      {...anim}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="h-56 flex items-center justify-center">
        <Suspense fallback={fallback}>
          <CarModelViewer
            modelPath={car.modelPath}
            modelType={car.type}
            quality="low"
          />
        </Suspense>
      </div>
      <div className="text-center mt-5">
        <h3 className="text-xl font-semibold text-white">{car.label}</h3>
        <p className="text-sm text-gray-400 mt-1">{car.desc}</p>
      </div>
    </motion.button>
  );
});

// ---------- HomePage ----------
const HomePage = memo(function HomePage({ onCarSelect }) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { booking, setBooking } = useContext(BookingContext);
  const location = useLocation();

  // refs for lazy-mount areas
  const progressRef = useRef(null);
  const beforeAfterRef = useRef(null);
  const reviewsRef = useRef(null);
  const floatingContactRef = useRef(null);

  const progressOnScreen = useOnScreenOnce(progressRef, "200px");
  const beforeAfterOnScreen = useOnScreenOnce(beforeAfterRef, "300px");
  const reviewsOnScreen = useOnScreenOnce(reviewsRef, "300px");
  const floatingContactOnScreen = useOnScreenOnce(floatingContactRef, "800px");

  // state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mountedHeavy, setMountedHeavy] = useState(false);
  const [modelsPreloaded, setModelsPreloaded] = useState(false);

  // motion presets (created once)
  const fadeUp = useMemo(() => {
    if (prefersReducedMotion) return {};
    return {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.45, ease: "easeOut" },
      viewport: { once: true, margin: "-10%" },
    };
  }, [prefersReducedMotion]);

  const heroAnim = useMemo(() => {
    if (prefersReducedMotion) return {};
    return {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" },
    };
  }, [prefersReducedMotion]);

  // handlers
  const handleCarSelect = useCallback(
    (carType) => {
      if (onCarSelect) onCarSelect(carType);
      setBooking((prev) => ({ ...prev, carType }));
      navigate("/services");
    },
    [navigate, onCarSelect, setBooking]
  );

  const nextSlide = useCallback(
    () => setCurrentSlide((p) => clampIndex(p + 1, CARS.length)),
    []
  );
  const prevSlide = useCallback(
    () => setCurrentSlide((p) => clampIndex(p - 1, CARS.length)),
    []
  );

  // progressive hydration: mount heavy content after micro delay or first interaction
  useEffect(() => {
    if (mountedHeavy) return;
    const t = setTimeout(() => setMountedHeavy(true), 380);
    const onFirstInteraction = () => {
      clearTimeout(t);
      setMountedHeavy(true);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("mousemove", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
    window.addEventListener("pointerdown", onFirstInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", onFirstInteraction, { passive: true });
    window.addEventListener("mousemove", onFirstInteraction, { passive: true });
    window.addEventListener("touchstart", onFirstInteraction, {
      passive: true,
    });
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("mousemove", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
  }, [mountedHeavy]);

  // model preloading: connection-aware + idle callback
  useEffect(() => {
    if (modelsPreloaded) return;

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const effectiveType = connection?.effectiveType || "";
    const slow =
      effectiveType.includes("2g") ||
      effectiveType.includes("slow-2g") ||
      connection?.saveData;

    if (slow) {
      setModelsPreloaded(true);
      return;
    }

    const preload = async () => {
      // try drei's preloader
      try {
        const drei = await import("@react-three/drei").catch(() => null);
        if (drei?.useGLTF?.preload) {
          for (const c of CARS) {
            try {
              drei.useGLTF.preload(c.modelPath);
            } catch {}
          }
          setModelsPreloaded(true);
          return;
        }
      } catch {}

      // fallback: warm HTTP cache (same-origin)
      try {
        await Promise.all(
          CARS.map((c) =>
            fetch(c.modelPath, {
              method: "GET",
              cache: "force-cache",
              mode: "same-origin",
            }).catch(() => null)
          )
        );
      } finally {
        setModelsPreloaded(true);
      }
    };

    const idle = (cb) =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(cb, { timeout: 800 })
        : setTimeout(cb, 300);

    idle(preload);
  }, [modelsPreloaded]);

  // handle location-based scroll
  useEffect(() => {
    const target =
      location.state?.scrollTo &&
      document.getElementById(location.state.scrollTo);
    if (target)
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
  }, [location, prefersReducedMotion]);

  // shared fallback
  const carFallback = useMemo(() => <Skeleton className="h-56 w-full" />, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F11] via-[#0E1417] to-[#0A0F11] text-white overflow-x-hidden">
      {/* Header */}
      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        }
      >
        <Header />
      </Suspense>

      {/* Floating Contact */}
      <div ref={floatingContactRef} aria-hidden>
        {floatingContactOnScreen && mountedHeavy ? (
          <Suspense fallback={null}>
            <FloatingContact />
          </Suspense>
        ) : null}
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden sm:py-4 md:py-6">
        <img
          src={heroBackground}
          alt="High-end car detailing background"
          fetchpriority="high"
          decoding="async"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/50" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
          {...heroAnim}
        >
          <Link
            to="/"
            className="flex justify-center"
            aria-label="Precision Toronto home"
          >
            <img
              src={logo}
              alt="Precision Toronto Logo"
              width={176}
              height={176}
              className="w-44 md:w-56 h-auto mx-auto rounded-full shadow-lg"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </Link>

          <p className="mt-6 text-lg md:text-2xl text-gray-300 tracking-wide">
            Luxury Auto Detailing Excellence
          </p>

          {/* Features (no hooks inside loops) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-12 mb-12">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.title}
                Icon={f.icon}
                title={f.title}
                description={f.description}
                anim={
                  prefersReducedMotion
                    ? {}
                    : {
                        ...fadeUp,
                        transition: {
                          ...(fadeUp.transition || {}),
                          ...stagger(i, 0.06),
                        },
                      }
                }
              />
            ))}
          </div>

          <motion.button
            onClick={() =>
              document
                .getElementById("car-selection")
                ?.scrollIntoView({
                  behavior: prefersReducedMotion ? "auto" : "smooth",
                })
            }
            className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-xl transition-all sm:mb-7 lg:mb-0"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Progress Tracker */}
      <div ref={progressRef}>
        {progressOnScreen ? (
          <Suspense
            fallback={
              <div className="px-6">
                <Skeleton className="h-6 w-64" />
              </div>
            }
          >
            <ProgressTracker currentStep={1} />
          </Suspense>
        ) : (
          <div className="px-6 py-4" />
        )}
      </div>

      {/* Car Selection */}
      <section
        id="car-selection"
        className="py-20 px-6 bg-gradient-to-b from-[#101518] to-[#0A0F11]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4 tracking-wide">
              Choose Your Vehicle
            </h2>
            <p className="text-lg text-gray-400">
              Select your vehicle to see customized services and pricing
            </p>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-4 gap-8">
            {CARS.map((car, idx) => (
              <CarCard
                key={car.type}
                car={car}
                onSelect={handleCarSelect}
                anim={
                  prefersReducedMotion
                    ? {}
                    : {
                        ...fadeUp,
                        transition: {
                          ...(fadeUp.transition || {}),
                          ...stagger(idx, 0.08),
                        },
                      }
                }
                fallback={carFallback}
              />
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="block lg:hidden relative max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <CarouselItem
                key={CARS[currentSlide].type}
                car={CARS[currentSlide]}
                onSelect={handleCarSelect}
                anim={
                  prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 28 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -28 },
                        transition: { duration: 0.36 },
                      }
                }
                fallback={carFallback}
              />
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6 relative">
              <button
                onClick={prevSlide}
                aria-label="Previous vehicle"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/12 hover:bg-white/25 text-white shadow-lg backdrop-blur-md transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                className="flex gap-2 absolute left-1/2 -translate-x-1/2"
                aria-hidden="true"
              >
                {CARS.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === currentSlide ? "bg-blue-400" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                aria-label="Next vehicle"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/12 hover:bg-white/25 text-white shadow-lg backdrop-blur-md transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After grid (images lazy) */}
      <section className="bg-gradient-to-b from-[#0F1518] to-[#0A0F11] py-20">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-blue-400 text-center mb-6"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
        >
          Stunning Before & After Results
        </motion.h2>

        <motion.p
          className="text-gray-400 text-center max-w-2xl mx-auto mb-12 px-4 leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          viewport={{ once: true }}
        >
          Witness the difference precision makes — from worn-out finishes to
          showroom-level brilliance.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-6">
          {beforeAfterPairs.map((pair, idx) => (
            <motion.figure
              key={idx}
              className="relative overflow-hidden rounded-xl shadow-lg group"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.36, delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <img
                src={pair.before}
                alt="Before detailing"
                className="w-full h-64 md:h-72 lg:h-80 object-cover absolute inset-0 group-hover:opacity-0 transition-opacity duration-500"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                Before
              </span>

              <img
                src={pair.after}
                alt="After detailing"
                className="w-full h-64 md:h-72 lg:h-80 object-cover"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <span className="absolute top-3 right-3 bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                After
              </span>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* Heavy slider lazy-mount only when visible */}
      <div
        ref={beforeAfterRef}
        className="py-20 px-6 bg-gradient-to-b from-[#0F1518] to-[#0A0F11]"
      >
        <div className="max-w-5xl mx-auto">
          {beforeAfterOnScreen && mountedHeavy ? (
            <Suspense fallback={<Skeleton className="h-[420px] w-full" />}>
              <BeforeAfterSlider />
            </Suspense>
          ) : (
            <Skeleton className="h-[420px] w-full" />
          )}
        </div>
      </div>

      {/* Reviews */}
      <div ref={reviewsRef}>
        {reviewsOnScreen && mountedHeavy ? (
          <Suspense
            fallback={
              <div className="py-10 px-6">
                <Skeleton className="h-36 w-full" />
              </div>
            }
          >
            <ReviewsCarousel />
          </Suspense>
        ) : (
          <div className="py-10" />
        )}
      </div>

      {/* Footer */}
      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        }
      >
        <Footer />
      </Suspense>
    </div>
  );
});

export default HomePage;
