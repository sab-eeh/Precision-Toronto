// src/pages/HomePage.jsxxx
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
    type: "coupe",
    label: " 2 Door Coupe",
    desc: "Luxury sports car treatment",
    modelPath: "/models/coupe/scene.gltf",
  },
  {
    type: "sedan",
    label: "4 Door Sedan",
    desc: "Perfect for daily drivers",
    modelPath: "/models/sedan/scene.gltf",
  },
  {
    type: "suv1",
    label: "5 Seater SUV",
    desc: "Ideal for small family",
    modelPath: "/models/suv1/scene.gltf",
  },
  {
    type: "suv2",
    label: "6+ Seater SUV",
    desc: "Best for large family vehicles",
    modelPath: "/models/suv2/scene.gltf",
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
      group
      w-full max-w-[240px]
      rounded-2xl
      text-center
      p-4
    
      bg-white/80
      backdrop-blur-xl
    
      border border-white/20
    
      text-black
    
      shadow-[0_4px_20px_rgba(0,0,0,0.15)]
      
      transition-all duration-300 ease-out
    
      hover:-translate-y-2
      hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]
      hover:shadow-blue-500/10
      hover:bg-gradient-to-b hover:from-blue-950 hover:to-blue-600
    "
      {...anim}
      style={{ willChange: "transform, opacity" }}
    >
      {/* TOP FADE / GLASS EFFECT */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent opacity-60" />
      </div>

      {/* 3D MODEL */}
      <div className="h-48 flex items-center justify-center relative z-10">
        <Suspense fallback={<Skeleton className="h-56 w-full" />}>
          <CarModelViewer
            modelPath={car.modelPath}
            modelType={car.type}
            quality="auto"
          />
        </Suspense>
      </div>

      {/* TEXT */}
      <div className="text-center mt-5 relative z-10">
        <h3 className="text-lg font-semibold tracking-tight">{car.label}</h3>
        <p className="text-sm text-gray-600 group-hover:text-black ">
          {car.desc}
        </p>
      </div>

      {/* BLUE GLOW (ONLY ON HOVER) */}
      <div
        className="
    absolute inset-0 rounded-2xl
    opacity-0 group-hover:opacity-100
    transition duration-300
    shadow-[0_0_40px_rgba(59,130,246,0.15)]
    pointer-events-none
  "
      />
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
      {/* Floating Contact */}
      <div ref={floatingContactRef}>
        {floatingContactOnScreen ? (
          <Suspense fallback={null}>
            <FloatingContact />
          </Suspense>
        ) : null}
      </div>

      {/* HERO */}
      <section className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src={heroBackground}
          alt="Luxury vehicle detailing service"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <motion.div
          className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center"
          {...heroAnim}
        >
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight">
            PRECISION ISN’T A SERVICE
            <br className="hidden sm:block" />
            <span className="px-2">IT’S A STANDARD.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">
            Experience True Vehicle Care
          </p>

          {/* Supporting Line */}
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-300 leading-relaxed">
            Premium Detailing & Protection Services
            <br className="hidden sm:block" />
            Serving Durham Region & Greater Toronto Area
          </p>

          {/* CTA */}
          <motion.button
            onClick={() =>
              document.getElementById("booking-section")?.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
              })
            }
            className="mt-6 sm:mt-8 px-8 sm:px-10 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-full shadow-xl transition-all w-full sm:w-auto"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          >
            Get Started
          </motion.button>

          {/* Rating */}
          <div className="mt-5 sm:mt-6 flex flex-col items-center">
            <div className="flex gap-1 text-yellow-400 text-xl sm:text-2xl md:text-3xl tracking-wide">
              ★★★★★
            </div>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-300">
              5-Star Rated Detailing Service
            </p>
          </div>
        </motion.div>
      </section>

      <div id="booking-section">
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
          className="pb-8 flex items-center justify-center bg-gradient-to-b from-[#101518] to-[#0A0F11]"
        >
          <div className="w-full max-w-7xl mx-auto px-5 lg:px-10">
            {/* Heading */}
            <div className="text-center mb-3 lg:mb-4">
              <h2 className="text-3xl lg:text-4xl font-bold mb-2 tracking-wide">
                Choose Your Vehicle
              </h2>
              <p className="text-sm lg:text-lg text-gray-400 max-w-md mx-auto">
                Select your vehicle to view packages & instant pricing
              </p>
            </div>

            {/* Desktop grid */}
            <div className="hidden lg:grid grid-cols-5 gap-5 justify-items-center items-center">
              {CARS.map((car, idx) => (
                <div key={car.type} className="w-full  flex justify-center">
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
                    <Skeleton className="h-[340px] w-full max-w-[260px]" />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            <div className="lg:hidden flex flex-col items-center justify-center">
              <div className="w-full max-w-xs flex justify-center">
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
                              initial: { opacity: 0, y: 20 },
                              animate: { opacity: 1, y: 0 },
                              exit: { opacity: 0, y: -20 },
                              transition: { duration: 0.3 },
                            }
                      }
                    />
                  ) : (
                    <Skeleton className="h-[320px] w-full" />
                  )}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between w-full max-w-xs mt-5">
                <button
                  onClick={prevSlide}
                  aria-label="Previous vehicle"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {CARS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        idx === currentSlide ? "bg-blue-400" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  aria-label="Next vehicle"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ===== Before & After (Grid) ===== */}
      <section className="bg-gradient-to-b from-[#0F1518] to-[#0A0F11] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Heading */}
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 text-center"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
          >
            Stunning Before & After Results
          </motion.h2>

          {/* Subtext */}
          <motion.p
            className="mt-4 text-sm sm:text-base md:text-lg text-gray-400 text-center max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            viewport={{ once: true }}
          >
            Witness the difference precision makes — from worn-out finishes to
            showroom-level brilliance.
          </motion.p>

          {/* Grid */}
          <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {beforeAfterPairs.map((pair, idx) => {
              const isTapped = activeIndex === idx;

              return (
                <motion.figure
                  key={idx}
                  className="relative overflow-hidden rounded-xl shadow-md group cursor-pointer select-none"
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => handleToggle(idx)}
                >
                  {/* BEFORE */}
                  <img
                    src={pair.before}
                    alt="Before detailing"
                    className={[
                      "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                      "md:group-hover:opacity-0",
                      isTapped ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                    loading="lazy"
                  />

                  <span className="hidden md:inline-flex absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-md shadow z-10">
                    Before
                  </span>

                  {/* AFTER */}
                  <img
                    src={pair.after}
                    alt="After detailing"
                    className="w-full h-[240px] sm:h-[260px] md:h-[280px] lg:h-[300px] object-cover"
                    loading="lazy"
                  />

                  <span className="hidden md:inline-flex absolute top-3 right-3 bg-blue-800 text-white text-xs font-semibold px-3 py-1 rounded-md shadow z-10">
                    After
                  </span>

                  {/* Mobile Hint */}
                  <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-black/60 text-white text-[11px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                      {isTapped ? "Tap to view BEFORE" : "Tap to view AFTER"}
                    </div>
                  </div>
                </motion.figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Heavy Slider Section ===== */}
      <section
        ref={beforeAfterRef}
        className="bg-gradient-to-b from-[#0F1518] to-[#0A0F11] py-16 sm:py-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {beforeAfterOnScreen ? (
            <Suspense
              fallback={
                <Skeleton className="h-[300px] sm:h-[380px] md:h-[420px] w-full rounded-xl" />
              }
            >
              <BeforeAfterSlider />
            </Suspense>
          ) : (
            <Skeleton className="h-[300px] sm:h-[380px] md:h-[420px] w-full rounded-xl" />
          )}
        </div>
      </section>

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
    </div>
  );
});

export default HomePage;
