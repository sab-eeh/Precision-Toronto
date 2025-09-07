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

// centralized assets (barrel file)
import {
  heroBackground,
  section1,
  section2,
  section3,
  beforeAfterPairs,
  logo,
} from "../assets/home";

// lazy heavy bits
const CarModelViewer = lazy(() => import("../components/ui/CarModelViewer"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const BeforeAfterSlider = lazy(() => import("../components/BeforeAfterSlider"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));

// lightweight skeletons
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/6 rounded-2xl ${className}`} />
);

// ---------- Memoized UI pieces ----------
const FeatureCard = memo(function FeatureCard({
  Icon,
  title,
  description,
  anim,
}) {
  return (
    <motion.div
      className="p-6 rounded-2xl bg-black/45 border border-white/8 shadow-md hover:shadow-blue-500/20 transition-all"
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
      className="text-left rounded-2xl p-5 bg-white/5 backdrop-blur-md border border-white/8 shadow-lg hover:shadow-blue-400/20 hover:ring-2 hover:ring-cyan-400/30 transition"
      {...anim}
      viewport={{ once: true }}
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
const HomePage = ({ onCarSelect }) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { booking, setBooking } = useContext(BookingContext);

  // static lists memoized
  const features = useMemo(
    () => [
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

  // UI state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mountedHeavy, setMountedHeavy] = useState(false); // progressive hydration
  const [modelsPreloaded, setModelsPreloaded] = useState(false);

  // handlers memoized
  const handleCarSelect = useCallback(
    (carType) => {
      if (onCarSelect) onCarSelect(carType);
      setBooking({ ...booking, carType });
      navigate("/services");
    },
    [navigate, onCarSelect, booking, setBooking]
  );

  const nextSlide = useCallback(
    () => setCurrentSlide((p) => (p + 1) % cars.length),
    [cars.length]
  );
  const prevSlide = useCallback(
    () => setCurrentSlide((p) => (p - 1 + cars.length) % cars.length),
    [cars.length]
  );

  // Fade-up animation props (respect reduced motion)
  const fadeUp = useMemo(
    () =>
      prefersReducedMotion
        ? {}
        : {
            initial: { opacity: 0, y: 30 },
            whileInView: { opacity: 1, y: 0 },
            transition: { duration: 0.6, ease: "easeOut" },
            viewport: { once: true, margin: "-10%" },
          },
    [prefersReducedMotion]
  );

  // progressive hydration: mount heavy content after small delay or on first interaction
  useEffect(() => {
    if (mountedHeavy) return;
    let t = setTimeout(() => setMountedHeavy(true), 700); // adjust as needed
    const onFirstInteraction = () => {
      clearTimeout(t);
      setMountedHeavy(true);
      window.removeEventListener("mousemove", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    window.addEventListener("mousemove", onFirstInteraction, { passive: true });
    window.addEventListener("touchstart", onFirstInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", onFirstInteraction, { passive: true });

    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, [mountedHeavy]);

  // idle-time + interaction-based model preloading
  useEffect(() => {
    if (modelsPreloaded) return;

    const preloadModels = async () => {
      try {
        // prefer drei's useGLTF.preload if available
        const drei = await import("@react-three/drei");
        if (typeof drei.useGLTF?.preload === "function") {
          cars.forEach((c) => drei.useGLTF.preload(c.modelPath));
          setModelsPreloaded(true);
          return;
        }
      } catch (e) {
        // ignore if drei not present
      }

      // fallback: fetch and cache model files (fetch only minimal hint to warm browser cache)
      try {
        await Promise.all(
          cars.map((c) =>
            fetch(c.modelPath, {
              method: "GET",
              mode: "no-cors",
              cache: "force-cache",
            }).catch(() => null)
          )
        );
        setModelsPreloaded(true);
      } catch {
        /* noop */
      }
    };

    const idle = (cb) =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(cb)
        : setTimeout(cb, 250);
    idle(preloadModels);

    // also preload after first user gesture
    const onFirstGesture = () => {
      preloadModels();
      window.removeEventListener("mousemove", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };

    window.addEventListener("mousemove", onFirstGesture, {
      passive: true,
      once: true,
    });
    window.addEventListener("touchstart", onFirstGesture, {
      passive: true,
      once: true,
    });
    window.addEventListener("keydown", onFirstGesture, {
      passive: true,
      once: true,
    });

    return () => {
      window.removeEventListener("mousemove", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, [cars, modelsPreloaded]);

  // small optimized fallbacks we reuse
  const carFallback = <Skeleton className="h-56 w-full" />;

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

      {/* Floating Contact (non-critical) */}
      <Suspense fallback={null}>
        <FloatingContact />
      </Suspense>

      {/* HERO (LCP image as <img>) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden sm:py-4 md:py-6">
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
              className="w-46 md:w-56 h-auto mx-auto rounded-full shadow-lg"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </Link>

          <p className="mt-6 text-lg md:text-2xl text-gray-300 tracking-wide">
            Luxury Auto Detailing Excellence
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-12 mb-12">
            {features.map((f, i) => (
              <FeatureCard
                key={f.title}
                Icon={f.icon}
                title={f.title}
                description={f.description}
                anim={{
                  ...fadeUp,
                  transition: { ...(fadeUp.transition || {}), delay: i * 0.08 },
                }}
              />
            ))}
          </div>

          <motion.button
            onClick={() =>
              document.getElementById("car-selection")?.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
              })
            }
            className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-xl transition-all sm:mb-7 lg:mb-0"
            whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>

      {/* Progress Tracker - non-critical, lazy */}
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

          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-4 gap-8">
            {cars.map((car, idx) => (
              <CarCard
                key={car.type}
                car={car}
                onSelect={handleCarSelect}
                anim={{
                  ...fadeUp,
                  transition: {
                    ...(fadeUp.transition || {}),
                    delay: idx * 0.12,
                  },
                }}
                fallback={carFallback}
              />
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="block lg:hidden relative max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <CarouselItem
                key={cars[currentSlide].type}
                car={cars[currentSlide]}
                onSelect={handleCarSelect}
                anim={
                  prefersReducedMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 50 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -50 },
                        transition: { duration: 0.45 },
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Stunning Before & After Results
        </motion.h2>

        <motion.p
          className="text-gray-400 text-center max-w-2xl mx-auto mb-12 px-4 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
        >
          Witness the difference precision makes — from worn-out finishes to
          showroom-level brilliance.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-6">
          {beforeAfterPairs.map((pair, idx) => (
            <motion.div
              key={idx}
              className="relative overflow-hidden rounded-xl shadow-lg group"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              viewport={{ once: true }}
            >
              <img
                src={pair.before}
                alt="Before detailing"
                className="w-full h-64 md:h-72 lg:h-80 object-cover absolute inset-0 group-hover:opacity-0 transition-opacity duration-700"
                loading="lazy"
                decoding="async"
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
              />
              <span className="absolute top-3 right-3 bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                After
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About / Why choose us */}
      <section className="bg-gradient-to-b from-[#0F1518] to-[#0A0F11]">
        <div className="py-20 px-6 relative">
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
                , we elevate automotive detailing into a luxury experience.
                Every vehicle we touch is treated with precision, care, and
                world-class techniques designed to restore its true beauty.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mt-6">
                From flawless paint correction to meticulous interior
                restoration, we specialize in luxury, exotic, and performance
                cars—delivering showroom-level results that highlight elegance
                and prestige.
              </p>
              <p className="text-gray-300 leading-relaxed text-lg mt-6">
                Our mission is simple: to transform your vehicle into a
                reflection of perfection, combining passion with innovation in
                every detail.
              </p>
            </motion.div>

            <motion.div
              className="lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6"
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 30 },
                    whileInView: { opacity: 1, y: 0 },
                    transition: { duration: 0.6, delay: 0.08 },
                  })}
              viewport={{ once: true }}
            >
              <img
                src={section1}
                alt="Luxury detailing"
                className="w-full h-[260px] md:h-[380px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
                loading="lazy"
                decoding="async"
                width={640}
                height={280}
              />
              <img
                src={section2}
                alt="Interior cleaning"
                className="w-full h-[260px] md:h-[380px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
                loading="lazy"
                decoding="async"
                width={640}
                height={280}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BeforeAfterSlider (heavy) - mount only when progressive hydration allows */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0F1518] to-[#0A0F11]">
        <div className="max-w-5xl mx-auto">
          {mountedHeavy ? (
            <Suspense fallback={<Skeleton className="h-[420px] w-full" />}>
              <BeforeAfterSlider />
            </Suspense>
          ) : (
            <div className="h-[420px] w-full">
              <Skeleton className="h-[420px] w-full" />
            </div>
          )}
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
