import React, {
  useState,
  useMemo,
  useEffect,
  useContext,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Title, Meta } from "react-head";
import { BookingContext } from "../context/BookingContext";
import ServiceCard from "../components/ServiceCard";
import Button from "../components/ui/Button";

// ✅ Lazy load non-critical UI
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));

import { servicesData, addonsData } from "../data/servicesData";

// Convert "2h 30m" or "45m" to total minutes
const parseDuration = (str) => {
  if (!str) return null;
  let hours = 0,
    minutes = 0;
  const hrMatch = str.match(/(\d+)\s*h/);
  const minMatch = str.match(/(\d+)\s*m/);
  if (hrMatch) hours = parseInt(hrMatch[1], 10);
  if (minMatch) minutes = parseInt(minMatch[1], 10);
  return hours * 60 + minutes;
};

// Convert total minutes back to "xh ym"
const formatDuration = (mins) => {
  if (!mins) return "Est. time";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/* Accessible horizontal scroller for mobile */
const Carousel = React.memo(({ children, idPrefix = "carousel" }) => {
  const scrollRef = React.useRef(null);

  const scrollBy = useCallback((dir = 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollBy({ left: dir * w * 0.9, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory touch-pan-x py-2 scrollbar-hide"
        role="list"
        aria-labelledby={`${idPrefix}-label`}
      >
        {React.Children.map(children, (child) => (
          <div className="min-w-[260px] sm:min-w-[300px] lg:min-w-0 snap-center">
            {child}
          </div>
        ))}
      </div>

      {/* Desktop arrows */}
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-900 to-gray-800/80 rounded-full w-10 h-10 shadow-lg transition"
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 bg-gradient-to-l from-gray-900 to-gray-800/80 rounded-full w-10 h-10 shadow-lg transition"
      >
        <ChevronRight />
      </button>
    </div>
  );
});

const CATEGORIES = [
  "Detailing",
  "Paint Correction",
  "Ceramic Coating",
  "Window Tinting",
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const {
    booking,
    toggleService,
    toggleAddon,
    incrementService,
    decrementService,
    incrementAddon,
    decrementAddon,
    totalPrice,
  } = useContext(BookingContext);

  const [step, setStep] = useState("chooseCategory");
  const [activeCategory, setActiveCategory] = useState("Detailing");

  // Smooth scroll to hash if present
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el)
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
    }
  }, [location]);

  const selectedCarType = booking.carType || "sedan";
  const allServices = useMemo(
    () =>
      Array.isArray(servicesData[selectedCarType])
        ? servicesData[selectedCarType]
        : [],
    [selectedCarType]
  );
  const availableAddons = useMemo(
    () =>
      Array.isArray(addonsData[selectedCarType])
        ? addonsData[selectedCarType]
        : [],
    [selectedCarType]
  );

  const servicesByCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) {
      map[cat] = allServices.filter((s) => s.category === cat);
    }
    return map;
  }, [allServices]);

  // ⏱ Calculate total duration
  const totalDurationMins = useMemo(() => {
    let total = 0;
    (booking.services || []).forEach((s) => {
      const mins = parseDuration(s.duration);
      if (mins) total += mins * (s.qty || 1);
    });
    (booking.addons || []).forEach((a) => {
      const mins = parseDuration(a.duration);
      if (mins) total += mins * (a.qty || 1);
    });
    return total;
  }, [booking.services, booking.addons]);

  const formattedDuration = formatDuration(totalDurationMins);

  // Handlers (memoized)
  const goToServices = useCallback((category) => {
    setActiveCategory(category);
    setStep("pickServices");
    requestAnimationFrame(() =>
      document
        .getElementById("services-section")
        ?.scrollIntoView({ behavior: "smooth" })
    );
  }, []);

  const goToAddons = useCallback(() => {
    setStep("addons");
    requestAnimationFrame(() =>
      document
        .getElementById("addons-section")
        ?.scrollIntoView({ behavior: "smooth" })
    );
  }, []);

  const goToSummary = useCallback(() => {
    setStep("summary");
    requestAnimationFrame(() =>
      document
        .getElementById("summary-section")
        ?.scrollIntoView({ behavior: "smooth" })
    );
  }, []);

  const handleContinueToBooking = useCallback(() => {
    navigate("/booking", {
      state: {
        selectedCar: booking.carType,
        selectedServices: booking.services || [],
        selectedAddons: booking.addons || [],
        totalPrice,
        totalDuration: totalDurationMins, // minutes
        formattedDuration, // human-friendly string
      },
    });
  }, [navigate, booking, totalPrice, totalDurationMins, formattedDuration]);

  return (
    <>
      <Title>Car Detailing Services | Precision Toronto</Title>
      <Meta
        name="description"
        content="Choose detailing, paint correction, ceramic coating, and window tinting services tailored to your car type."
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0A0F11] to-[#101518] text-white">
        <Suspense fallback={<div className="h-20 bg-gray-900 animate-pulse" />}>
          <Header />
        </Suspense>

        <Suspense fallback={null}>
          <FloatingContact />
        </Suspense>

        <Suspense fallback={<div className="h-6 bg-gray-800 animate-pulse" />}>
          <ProgressTracker currentStep={2} />
        </Suspense>

        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-6 flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={18} /> Back
            </Button>
            <h1 className="text-3xl font-bold">Choose Your Service</h1>
          </div>

          {/* Categories */}
          {step === "chooseCategory" && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-4">
                Which service are you looking for?
              </h2>
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => goToServices(cat)}
                    className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-blue-600 transition shadow"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Services */}
          <section id="services-section" className="mb-12">
            {(step === "pickServices" || step === "chooseCategory") && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">{activeCategory}</h3>
                  <Button
                    onClick={() => setStep("chooseCategory")}
                    variant="outline"
                  >
                    Change Category
                  </Button>
                </div>

                {/* Mobile carousel */}
                <div className="block lg:hidden mb-6">
                  <Carousel>
                    {(servicesByCategory[activeCategory] || []).map((s) => (
                      <ServiceCard
                        key={s.id ?? s.title}
                        {...s}
                        selected={
                          !!(booking.services || []).find(
                            (x) => x.id === (s.id ?? s.title)
                          )
                        }
                        onToggle={() =>
                          toggleService({ ...s, id: s.id ?? s.title })
                        }
                      />
                    ))}
                  </Carousel>
                </div>

                {/* Desktop grid */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-6">
                  {(servicesByCategory[activeCategory] || []).map((s) => (
                    <ServiceCard
                      key={s.id ?? s.title}
                      {...s}
                      selected={
                        !!(booking.services || []).find(
                          (x) => x.id === (s.id ?? s.title)
                        )
                      }
                      onToggle={() =>
                        toggleService({ ...s, id: s.id ?? s.title })
                      }
                    />
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    disabled={!(booking.services && booking.services.length)}
                    onClick={goToAddons}
                  >
                    Continue to Add-ons
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* Add-ons */}
          {step === "addons" && (
            <section id="addons-section" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4">Add-ons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {availableAddons.map((addon) => {
                  const id = addon.id ?? addon.title;
                  const active = !!(booking.addons || []).find(
                    (a) => a.id === id
                  );
                  const activeItem = (booking.addons || []).find(
                    (a) => a.id === id
                  );

                  return (
                    <div
                      key={id}
                      className={`p-5 rounded-2xl transition shadow border ${
                        active
                          ? "bg-blue-600 text-white border-blue-400"
                          : "bg-gray-800 text-gray-200 border-gray-700"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{addon.title}</h4>
                        <span className="font-bold">
                          ${Number(addon.price).toFixed(2)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 mb-4">
                        {addon.duration ? `⏱ ${addon.duration}` : "⏱ Est. time"}
                      </p>

                      {!active ? (
                        <Button
                          onClick={() => toggleAddon({ ...addon, id })}
                          className="w-full"
                          variant="secondary"
                        >
                          Add
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              onClick={() => decrementAddon(id)}
                              aria-label="Decrease"
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="min-w-[2ch] text-center font-semibold">
                              {activeItem?.qty ?? 1}
                            </span>
                            <Button
                              size="icon"
                              onClick={() => incrementAddon(id)}
                              aria-label="Increase"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => toggleAddon({ id })}
                          >
                            <X size={16} className="mr-1" /> Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setStep("pickServices")}
                >
                  Back to Services
                </Button>
                <Button onClick={goToSummary}>Continue to Summary</Button>
              </div>
            </section>
          )}

          {/* Summary */}
          {step === "summary" && (
            <section id="summary-section" className="mb-12">
              <h3 className="text-2xl font-semibold mb-4">Summary</h3>

              <div className="bg-gray-900 rounded-2xl p-6 mb-6 shadow-lg">
                {/* Services */}
                <div className="mb-6">
                  <h4 className="font-semibold">Selected Services</h4>
                  <ul className="mt-3 divide-y divide-gray-800">
                    {(booking.services || []).map((s) => (
                      <li
                        key={s.id}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{s.title}</div>
                          {s.description && (
                            <div className="text-sm text-gray-400 line-clamp-2">
                              {s.description}
                            </div>
                          )}
                          <div className="text-sm text-gray-400 mt-1">
                            ⏱ {s.duration || "Est. time"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            onClick={() => decrementService(s.id)}
                            aria-label="Decrease"
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="min-w-[2ch] text-center font-semibold">
                            {s.qty ?? 1}
                          </span>
                          <Button
                            size="icon"
                            onClick={() => incrementService(s.id)}
                            aria-label="Increase"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <div className="w-24 text-right font-semibold">
                          $
                          {(Number(s.price) * Math.max(1, s.qty || 1)).toFixed(
                            2
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => decrementService(s.id)}
                        >
                          <X size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add-ons */}
                <div className="mb-6">
                  <h4 className="font-semibold">Add-ons</h4>
                  <ul className="mt-3 divide-y divide-gray-800">
                    {(booking.addons || []).map((a) => (
                      <li
                        key={a.id}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0 text-gray-300">
                          {a.title}
                          <div className="text-sm text-gray-400 mt-1">
                            ⏱ {a.duration || "Est. time"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            onClick={() => decrementAddon(a.id)}
                            aria-label="Decrease"
                          >
                            <Minus size={16} />
                          </Button>
                          <span className="min-w-[2ch] text-center font-semibold">
                            {a.qty ?? 1}
                          </span>
                          <Button
                            size="icon"
                            onClick={() => incrementAddon(a.id)}
                            aria-label="Increase"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>

                        <div className="w-24 text-right font-semibold">
                          $
                          {(Number(a.price) * Math.max(1, a.qty || 1)).toFixed(
                            2
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => decrementAddon(a.id)}
                        >
                          <X size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Totals */}
                <div className="flex justify-between items-center font-bold text-xl">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg mt-2">
                  <span>Estimated Time</span>
                  <span>{formattedDuration}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("addons")}>
                  Back to Add-ons
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleContinueToBooking}
                    disabled={!(booking.services && booking.services.length)}
                  >
                    Continue to Booking
                  </Button>
                </div>
              </div>
            </section>
          )}
        </main>

        <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse" />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default ServicesPage;
