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
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BookingContext } from "../context/BookingContext";

import { heroBackground, beforeAfterPairs, logo } from "../assets/home";

// Lazy heavy components
const CarModelViewer = lazy(() => import("../components/ui/CarModelViewer"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const BeforeAfterSlider = lazy(() => import("../components/BeforeAfterSlider"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));
const ReviewsCarousel = lazy(() => import("../components/ReviewsCarousel"));

// Small skeleton
const Skeleton = memo(function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
  );
});

const FEATURES = Object.freeze([
  {
    icon: Star,
    title: "5-Star Rated",
    description: "Trusted by 1,000+ Customers & Businesses",
    link: "https://g.page/YOUR_GOOGLE_REVIEW_LINK",
  },
  {
    icon: MapPin,
    title: "Mobile Service",
    description: "We Come to You — Home or Work",
  },
  {
    icon: Store,
    title: "Drop-Off Service",
    description: "Convenient In-Shop Detailing Available",
  },
  {
    icon: Clock,
    title: "Time Efficient",
    description: "Quick Turnaround Without Compromising Quality",
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

const clampIndex = (i, len) => (i + len) % len;

function useOnScreenOnce(ref, rootMargin = "0px") {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (seen || !ref.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );

    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [seen, ref, rootMargin]);

  return seen;
}

// Feature card
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
      <Icon className="w-10 h-10 text-blue-400 mx-auto mb-4" aria-hidden />
      <h3 className="font-semibold text-sm md:text-base text-blue-400 uppercase tracking-wide">
        {title}
      </h3>
      <p className="mt-1 text-xs md:text-sm text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
});

// Car Card (desktop)
const CarCard = memo(function CarCard({ car, onSelect, anim }) {
  const handleClick = useCallback(
    () => onSelect(car.type),
    [onSelect, car.type]
  );

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="
        w-full max-w-[280px]
        rounded-2xl
        text-center
        p-5
        bg-white/5
        backdrop-blur-md
        border border-white/10
        shadow-lg
        hover:shadow-blue-400/20
        hover:ring-2 hover:ring-cyan-400/30
        transition
      "
      {...anim}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="h-56 flex items-center justify-center">
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
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

// Carousel Item (mobile)
const CarouselItem = memo(function CarouselItem({ car, onSelect, anim }) {
  const handleClick = useCallback(
    () => onSelect(car.type),
    [onSelect, car.type]
  );

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="text-left rounded-2xl p-6 bg-gradient-to-br from-[#1a1f23] to-[#101518] backdrop-blur-lg border border-white/10 shadow-xl transition"
      {...anim}
      style={{ willChange: "transform, opacity" }}
    >
      <div className="h-56 flex items-center justify-center">
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
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

const HomePage = memo(function HomePage({ onCarSelect }) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { setBooking } = useContext(BookingContext);
  const location = useLocation();

  const progressRef = useRef(null);
  const beforeAfterRef = useRef(null);
  const reviewsRef = useRef(null);
  const floatingContactRef = useRef(null);
  const carSectionRef = useRef(null);

  const progressOnScreen = useOnScreenOnce(progressRef, "200px");
  const beforeAfterOnScreen = useOnScreenOnce(beforeAfterRef, "250px");
  const reviewsOnScreen = useOnScreenOnce(reviewsRef, "250px");
  const floatingContactOnScreen = useOnScreenOnce(floatingContactRef, "800px");

  // 3D should mount only when car section is visible
  const carSectionOnScreen = useOnScreenOnce(carSectionRef, "250px");

  const [currentSlide, setCurrentSlide] = useState(0);

  const fadeUp = useMemo(() => {
    if (prefersReducedMotion) return {};
    return {
      initial: { opacity: 0, y: 18 },
      whileInView: { opacity: 1, y: 0 },
      transition: { duration: 0.45, ease: "easeOut" },
      viewport: { once: true, margin: "-10%" },
    };
  }, [prefersReducedMotion]);

  const heroAnim = useMemo(() => {
    if (prefersReducedMotion) return {};
    return {
      initial: { opacity: 0, y: 22 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.75, ease: "easeOut" },
    };
  }, [prefersReducedMotion]);

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

  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (idx) => {
    setActiveIndex((prev) => (prev === idx ? null : idx));
  };

  // Scroll to section if routed with state.scrollTo
  useEffect(() => {
    const id = location.state?.scrollTo;
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [location, prefersReducedMotion]);

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
      <div ref={floatingContactRef}>
        {floatingContactOnScreen ? (
          <Suspense fallback={null}>
            <FloatingContact />
          </Suspense>
        ) : null}
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden translate-y-[-40px] md:translate-y-0">
        {/* Background Image */}
        <img
          src={heroBackground}
          alt="Luxury vehicle detailing service"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          {...heroAnim}
        >
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            PRECISION ISN’T A SERVICE.
            <br />
            IT’S A STANDARD.
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-3xl text-gray-300">
            Experience True Vehicle Care
          </p>

          {/* Supporting Line */}
          <p className="mt-3 text-base font-semibold md:text-2xl text-gray-300">
            Premium Detailing & Protection Services
            <br />
            Serving Durham Region & Greater Toronto Area
          </p>

          {/* CTA Button */}
          <motion.button
            onClick={() =>
              document.getElementById("car-selection")?.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
              })
            }
            className="mt-8 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-2xl transition-all"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            Book now
          </motion.button>

          {/* Star Rating Section */}
          <div className="mt-6 flex flex-col items-center">
            <div className="flex gap-12 text-yellow-400 text-3xl">
              {"★ ★ ★ ★ ★"}
            </div>
            <p className="mt-2 text-gray-300 text-lg">
              5-Star Rated Detailing Service
            </p>
          </div>
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
        ref={carSectionRef}
        className="py-24 bg-gradient-to-b from-[#101518] to-[#0A0F11]"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4 tracking-wide">
              Choose Your Vehicle
            </h2>
            <p className="text-lg text-gray-400">
              Select your vehicle to View packages & instant pricing
            </p>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6 justify-items-center">
            {CARS.map((car, idx) => (
              <div key={car.type} className="w-full flex justify-center">
                {carSectionOnScreen ? (
                  <CarCard
                    car={car}
                    onSelect={handleCarSelect}
                    anim={
                      prefersReducedMotion
                        ? {}
                        : {
                            ...fadeUp,
                            transition: {
                              ...(fadeUp.transition || {}),
                              delay: idx * 0.08,
                            },
                          }
                    }
                  />
                ) : (
                  <Skeleton className="h-[360px] w-full max-w-[280px]" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="block lg:hidden relative max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              {carSectionOnScreen ? (
                <CarouselItem
                  key={CARS[currentSlide].type}
                  car={CARS[currentSlide]}
                  onSelect={handleCarSelect}
                  anim={
                    prefersReducedMotion
                      ? {}
                      : {
                          initial: { opacity: 0, y: 26 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -26 },
                          transition: { duration: 0.35 },
                        }
                  }
                />
              ) : (
                <Skeleton className="h-[360px] w-full" />
              )}
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

      {/* Before & After (static) */}
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
          {beforeAfterPairs.map((pair, idx) => {
            const isTapped = activeIndex === idx;

            return (
              <motion.figure
                key={idx}
                className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer select-none"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                viewport={{ once: true }}
                onClick={() => handleToggle(idx)}
              >
                {/* BEFORE image */}
                <img
                  src={pair.before}
                  alt="Before detailing"
                  className={[
                    "w-full h-64 md:h-72 lg:h-80 object-cover absolute inset-0 transition-opacity duration-500",
                    // Desktop hover
                    "md:group-hover:opacity-0",
                    // Mobile tap toggle
                    isTapped ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                <span className="hidden md:inline-flex absolute top-3 left-3 bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                  Before
                </span>

                {/* AFTER image */}
                <img
                  src={pair.after}
                  alt="After detailing"
                  className="w-full h-64 md:h-72 lg:h-80 object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                <span className="hidden md:inline-flex absolute top-3 right-3 bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                  After
                </span>

                {/* Mobile hint overlay */}
                <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-black/55 text-white text-xs font-medium px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
                    {isTapped ? "Tap to view BEFORE" : "Tap to view AFTER"}
                  </div>
                </div>
              </motion.figure>
            );
          })}
        </div>
      </section>

      {/* Heavy BeforeAfter slider */}
      <div
        ref={beforeAfterRef}
        className="py-20 px-6 bg-gradient-to-b from-[#0F1518] to-[#0A0F11]"
      >
        <div className="max-w-5xl mx-auto">
          {beforeAfterOnScreen ? (
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
        {reviewsOnScreen ? (
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
