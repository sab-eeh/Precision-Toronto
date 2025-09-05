// src/pages/HomePage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  lazy,
  Suspense,
  useContext
} from "react";
import { useNavigate, Link } from "react-router-dom";
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

// ⬇️ Centralized image imports from a single folder barrel (see instructions in chat)
import {
  heroBackground,
  section1,
  section2,
  section3,
  logo,
} from "../assets/home";

// ⬇️ Lazy-load heavy/interactive UI
const CarModelViewer = lazy(() => import("../components/ui/CarModelViewer"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const BeforeAfterSlider = lazy(() => import("../components/BeforeAfterSlider"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));

// Simple skeletons for lazy components
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/10 rounded-2xl ${className}`} />
);

const HomePage = ({ onCarSelect }) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Static data memoized to avoid re-allocations
  const features = useMemo(
    () => [
      {
        icon: Shield,
        title: "Premium Protection",
        description: "Ceramic coating and paint protection",
      },
      {
        icon: Clock,
        title: "Time Efficient",
        description: "Quick turnaround without compromising quality",
      },
      {
        icon: MapPin,
        title: "Mobile Service",
        description: "We come to your location in Toronto",
      },
      {
        icon: Star,
        title: "5-Star Reviews",
        description: "Trusted by 500+ satisfied customers",
      },
    ],
    []
  );

  const cars = useMemo(
    () => [
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
    ],
    []
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const { booking, setBooking } = useContext(BookingContext);

  const handleCarSelect = useCallback(
    (carType) => {
      if (onCarSelect) onCarSelect(carType);
      setBooking({ ...booking, carType })
      navigate("/services");
    },
    [navigate, onCarSelect, booking, setBooking]
  );

  const nextSlide = useCallback(
    () => setCurrentSlide((prev) => (prev + 1) % cars.length),
    [cars.length]
  );
  const prevSlide = useCallback(
    () => setCurrentSlide((prev) => (prev - 1 + cars.length) % cars.length),
    [cars.length]
  );

  // 🧠 Idle-time preloading for 3D models (works if CarModelViewer exposes a static preload or if drei is present)
  useEffect(() => {
    const modelPaths = cars.map((c) => c.modelPath);

    const preloadGLTFs = async () => {
      try {
        // If CarModelViewer exports a static preload(paths: string[])
        const mod = await import("../components/ui/CarModelViewer");
        if (typeof mod.default?.preload === "function") {
          mod.default.preload(modelPaths);
          return;
        }
      } catch {}

      // Fallback: try drei's useGLTF.preload
      try {
        const drei = await import("@react-three/drei");
        if (typeof drei.useGLTF?.preload === "function") {
          modelPaths.forEach((p) => drei.useGLTF.preload(p));
        }
      } catch {}
    };

    const idle = (cb) =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(cb)
        : setTimeout(cb, 150);
    idle(preloadGLTFs);
  }, [cars]);

  // Animation helpers
  const fadeUp = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
        viewport: { once: true, margin: "-10%" },
      };

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
      <Suspense fallback={null}>
        <FloatingContact />
      </Suspense>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden sm:py-4 md:py-6">
        {/* Use an <img> for LCP instead of CSS background so the browser can prioritize & lazy/eager load */}
        <img
          src={heroBackground}
          alt="High-end car detailing background"
          fetchPriority="high"
          decoding="async"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/50" />

        <motion.div
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
          {...(prefersReducedMotion
            ? {}
            : {
                initial: { opacity: 0, y: 40 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 1, ease: "easeOut" },
              })}
        >
          <Link to="/" className="flex justify-center">
            <img
              src={logo}
              alt="Precision Toronto Logo"
              width={176}
              height={176}
              className="w-46 md:w-56 h-auto mx-auto rounded-full shadow-lg sm:pt-5 md:pt-5 lg:pt-0"
              loading="lazy"
              decoding="async"
            />
          </Link>

          <p className="mt-6 text-lg md:text-2xl text-gray-300 tracking-wide">
            Luxury Auto Detailing Excellence
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-12 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-black/50 border border-white/10 shadow-md hover:shadow-blue-500/30 transition-all"
                  {...fadeUp}
                >
                  <Icon
                    className="w-10 h-10 text-blue-400 mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-sm md:text-base text-blue-400 uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs md:text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
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
            whileHover={prefersReducedMotion ? undefined : { scale: 1.08 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Progress Tracker */}
      <Suspense
        fallback={
          <div className="px-6">
            <Skeleton className="h-6 w-64" />
          </div>
        }
      >
        <ProgressTracker currentStep={1} />
      </Suspense>

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

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-8">
            {cars.map((car, index) => (
              <motion.button
                type="button"
                key={car.type}
                className="text-left rounded-2xl p-5 bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-blue-400/20 hover:ring-2 hover:ring-cyan-400/30 transition"
                onClick={() => handleCarSelect(car.type)}
                {...fadeUp}
                style={{ transitionDelay: `${index * 120}ms` }}
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
            ))}
          </div>

          {/* Mobile / Tablet Carousel */}
          <div className="block lg:hidden relative max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.button
                type="button"
                key={cars[currentSlide].type}
                className="text-left rounded-2xl p-6 bg-gradient-to-br from-[#1a1f23] to-[#101518] backdrop-blur-lg border border-white/10 shadow-xl transition"
                onClick={() => handleCarSelect(cars[currentSlide].type)}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
                animate={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -50 }
                }
                transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
              >
                <div className="h-56 flex items-center justify-center">
                  <Suspense fallback={<Skeleton className="h-56 w-full" />}>
                    <CarModelViewer
                      modelPath={cars[currentSlide].modelPath}
                      modelType={cars[currentSlide].type}
                      quality="auto"
                    />
                  </Suspense>
                </div>
                <div className="text-center mt-5">
                  <h3 className="text-xl font-semibold text-white">
                    {cars[currentSlide].label}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {cars[currentSlide].desc}
                  </p>
                </div>
              </motion.button>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6 relative">
              <button
                onClick={prevSlide}
                aria-label="Previous vehicle"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white shadow-lg backdrop-blur-md transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                className="flex gap-2 absolute left-1/2 -translate-x-1/2"
                aria-hidden="true"
              >
                {cars.map((_, idx) => (
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
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white shadow-lg backdrop-blur-md transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About & Why Choose Us */}
      <section className="bg-gradient-to-b from-[#0F1518] to-[#0A0F11]">
        <section className="py-20 px-6 relative">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <motion.div className="lg:w-1/2" {...fadeUp}>
              <h1 className="text-4xl font-bold text-white mb-6">
                About Us{" "}
                <span className="text-blue-400">– Precision Toronto</span>
              </h1>
              <p className="text-gray-300 leading-relaxed text-lg">
                At{" "}
                <span className="font-semibold text-white">
                  Precision Toronto
                </span>
                , we redefine automotive detailing as a luxury experience. Every
                service we provide is tailored to elevate your vehicle to
                showroom condition, using only the highest-quality products and
                cutting-edge techniques.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mt-6">
                From flawless paint correction to deep interior restoration, our
                attention to detail ensures your car reflects elegance and
                prestige. We specialize in luxury, exotic, and performance
                vehicles—treating each one with precision and respect.
              </p>
            </motion.div>

            <motion.div
              className="lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6"
              {...fadeUp}
            >
              <img
                src={section1}
                alt="Luxury detailing"
                className="w-full h-[260px] md:h-[280px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
                loading="lazy"
                decoding="async"
                width={640}
                height={280}
              />
              <img
                src={section2}
                alt="Interior cleaning"
                className="w-full h-[260px] md:h-[280px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
                loading="lazy"
                decoding="async"
                width={640}
                height={280}
              />
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-6 relative">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <motion.div className="lg:w-1/2" {...fadeUp}>
              <img
                src={section3}
                alt="Why Choose Us"
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl hover:scale-105 transition"
                loading="lazy"
                decoding="async"
              />
            </motion.div>

            <motion.div className="lg:w-1/2" {...fadeUp}>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why <span className="text-blue-400">Choose Us</span>
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                At{" "}
                <span className="font-semibold text-white">
                  Precision Toronto
                </span>
                , we believe detailing is more than just cleaning—it’s about
                care, protection, and bringing out the best in your vehicle. Our
                expert team uses premium products and proven techniques to
                deliver results that enhance both appearance and longevity.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mt-6">
                Whether it’s a daily commuter, a cherished classic, or a luxury
                performance car, we treat every vehicle with the same level of
                respect and precision. Our goal is simple: restore beauty,
                preserve value, and provide an exceptional detailing experience
                that leaves every customer confident and satisfied.
              </p>
            </motion.div>
          </div>
        </section>
      </section>

      {/* Before/After */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0F1518] to-[#0A0F11]">
        <div className="max-w-5xl mx-auto">
          <Suspense fallback={<Skeleton className="h-[420px] w-full" />}>
            <BeforeAfterSlider />
          </Suspense>
        </div>
      </section>

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
};

export default HomePage;
