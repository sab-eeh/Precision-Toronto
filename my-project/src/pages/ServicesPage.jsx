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
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Title, Meta } from "react-head";

import { BookingContext } from "../context/BookingContext";
import ServiceCard from "../components/ServiceCard";
import Button from "../components/ui/Button";

import { servicesData, addonsData } from "../data/servicesData";
import { parseDuration, formatDuration } from "../utils/duration";

/* Lazy Components */
const FloatingContact = lazy(() => import("../components/FloatingContact"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));

/* Constants */
const CATEGORIES = [
  "Detailing",
  "Paint Correction",
  "Ceramic Coating",
  "Window Tinting",
];

const STEPS = {
  CATEGORY: "chooseCategory",
  SERVICES: "pickServices",
  ADDONS: "addons",
  SUMMARY: "summary",
};

/* Helpers */
const scrollToSection = (id) => {
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  });
};

/* Carousel */
const Carousel = React.memo(({ children }) => {
  const ref = React.useRef(null);

  const scroll = (dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({
      left: dir * ref.current.clientWidth * 0.9,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-2 scrollbar-hide"
      >
        {React.Children.map(children, (child) => (
          <div className="min-w-[260px] sm:min-w-[300px] snap-center">
            {child}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll(-1)}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 w-10 h-10 rounded-full items-center justify-center"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={() => scroll(1)}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 w-10 h-10 rounded-full items-center justify-center"
      >
        <ChevronRight />
      </button>
    </div>
  );
});

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

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  /* Scroll from hash */
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.replace("#", ""));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  const selectedCarType = booking.carType || "sedan";

  /* Services */
  const allServices = useMemo(
    () => servicesData[selectedCarType] || [],
    [selectedCarType]
  );

  const servicesByCategory = useMemo(() => {
    return allServices.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
  }, [allServices]);

  /* Add-ons */
  const allAddons = useMemo(
    () => addonsData[selectedCarType] || [],
    [selectedCarType]
  );

  const generalAddons = useMemo(
    () => allAddons.filter((a) => a.type === "general"),
    [allAddons]
  );

  const ceramicAddons = useMemo(
    () => allAddons.filter((a) => a.type === "ceramic"),
    [allAddons]
  );

  /* Duration Calculation */
  const totalDuration = useMemo(() => {
    const calc = (items = []) =>
      items.reduce(
        (acc, item) => {
          const d = parseDuration(item.duration);
          if (!d) return acc;
          const qty = item.qty || 1;
          acc.min += d.min * qty;
          acc.max += d.max * qty;
          return acc;
        },
        { min: 0, max: 0 }
      );

    const services = calc(booking.services);
    const addons = calc(booking.addons);

    const total = {
      min: services.min + addons.min,
      max: services.max + addons.max,
    };

    return {
      ...total,
      avg: Math.round((total.min + total.max) / 2),
    };
  }, [booking.services, booking.addons]);

  const formattedDurations = useMemo(
    () => ({
      min: formatDuration(totalDuration.min),
      max: formatDuration(totalDuration.max),
      avg: formatDuration(totalDuration.avg),
    }),
    [totalDuration]
  );

  /* Navigation */
  const goToServices = useCallback((category) => {
    setActiveCategory(category);
    setStep(STEPS.SERVICES);
    scrollToSection("services-section");
  }, []);

  const goToAddons = useCallback(() => {
    setStep(STEPS.ADDONS);
    scrollToSection("addons-section");
  }, []);

  const goToSummary = useCallback(() => {
    setStep(STEPS.SUMMARY);
    scrollToSection("summary-section");
  }, []);

  const handleContinueToBooking = useCallback(() => {
    navigate("/booking", {
      state: {
        selectedCar: booking.carType,
        selectedServices: booking.services || [],
        selectedAddons: booking.addons || [],
        totalPrice,
        durationSummary: totalDuration,
        formattedDurations,
      },
    });
  }, [navigate, booking, totalPrice, totalDuration, formattedDurations]);

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
          </div>

          {/* Categories */}
          {step === "chooseCategory" && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12 px-2 sm:px-0"
            >
              {/* HEADER */}
              <div className="mb-6 max-w-xl">
                <h2 className="text-2xl font-semibold mb-1">
                  Choose a Service Category
                </h2>
                <p className="text-gray-400 text-sm">
                  Select the type of detailing service you’re looking for to get
                  started.
                </p>
              </div>

              {/* GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goToServices(cat)}
                    className="group text-left p-5 rounded-2xl border border-gray-700 bg-gray-800 hover:border-blue-500 hover:bg-blue-600/10 transition-all duration-200 shadow-sm"
                  >
                    {/* TITLE */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition">
                        {cat}
                      </h3>

                      <span className="text-gray-500 group-hover:text-blue-400 transition">
                        →
                      </span>
                    </div>

                    {/* SUBTEXT (Optional - scalable later) */}
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      Explore available services under {cat.toLowerCase()}.
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}
          {/* Services */}
          <section id="services-section" className="mb-12 px-2 sm:px-0">
            {(step === "pickServices" || step === "chooseCategory") && (
              <>
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <h3 className="text-2xl font-semibold">{activeCategory}</h3>

                  <Button
                    onClick={() => setStep("chooseCategory")}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Change Category
                  </Button>
                </div>

                {/* MOBILE CAROUSEL */}
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

                {/* DESKTOP GRID */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-8">
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

                {/* CERAMIC ADD-ONS */}
                {activeCategory === "Ceramic Coating" &&
                  ceramicAddons.length > 0 && (
                    <div className="mt-10">
                      <div className="mb-6 max-w-2xl">
                        <h4 className="text-xl font-semibold mb-1">
                          Recommended Ceramic Add-Ons
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Enhance protection where it matters most — shield your
                          wheels, glass, and interior from daily wear, water
                          damage, and long-term deterioration.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {ceramicAddons.map((addon) => {
                          const id =
                            addon.id ?? addon.title ?? addon.description;

                          const activeItem = (booking.addons || []).find(
                            (a) => a.id === id
                          );
                          const active = !!activeItem;

                          return (
                            <div
                              key={id}
                              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 shadow-sm ${
                                active
                                  ? "bg-blue-600/10 border-blue-500"
                                  : "bg-gray-800 border-gray-700 hover:border-gray-500"
                              }`}
                            >
                              {/* CONTENT */}
                              <div>
                                {addon.tag && (
                                  <span className="inline-block text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-2 py-1 rounded-full mb-3">
                                    {addon.tag}
                                  </span>
                                )}

                                <h4 className="font-semibold text-white mb-1">
                                  {addon.title}
                                </h4>

                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                  {addon.description}
                                </p>

                                <div className="flex justify-between items-center text-sm mb-4">
                                  <span className="text-gray-500">
                                    ⏱ {addon.duration || "Est. time"}
                                  </span>
                                  <span className="font-semibold text-white">
                                    ${Number(addon.price).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {/* ACTION */}
                              {!active ? (
                                <Button
                                  onClick={() => toggleAddon({ ...addon, id })}
                                  className="w-full"
                                  variant="secondary"
                                >
                                  Add Protection
                                </Button>
                              ) : (
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">
                                      Quantity
                                    </span>

                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="icon"
                                        onClick={() => decrementAddon(id)}
                                      >
                                        <Minus size={14} />
                                      </Button>

                                      <span className="w-6 text-center font-semibold text-white">
                                        {activeItem?.qty ?? 1}
                                      </span>

                                      <Button
                                        size="icon"
                                        onClick={() => incrementAddon(id)}
                                      >
                                        <Plus size={14} />
                                      </Button>
                                    </div>
                                  </div>

                                  <Button
                                    variant="outline"
                                    onClick={() => toggleAddon({ id })}
                                    className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* CTA */}
                <div className="flex justify-end">
                  <Button
                    disabled={!(booking.services && booking.services.length)}
                    onClick={goToAddons}
                    className="w-full sm:w-auto"
                  >
                    Continue to Add-ons
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* Add-ons (general only) */}
          {step === "addons" && (
            <section id="addons-section" className="mb-12 px-2 sm:px-0">
              <h3 className="text-2xl font-semibold mb-6">Add-ons</h3>

              {/* GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {generalAddons.map((addon) => {
                  const id = addon.id ?? addon.title;

                  const activeItem = (booking.addons || []).find(
                    (a) => a.id === id
                  );
                  const active = !!activeItem;

                  return (
                    <div
                      key={id}
                      className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 shadow-sm ${
                        active
                          ? "bg-blue-600/10 border-blue-500"
                          : "bg-gray-800 border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      {/* TOP CONTENT */}
                      <div>
                        {/* TAG */}
                        {addon.tag && (
                          <span className="inline-block text-xs bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-2 py-1 rounded-full mb-3">
                            {addon.tag}
                          </span>
                        )}

                        {/* TITLE */}
                        <h4 className="font-semibold text-white mb-1">
                          {addon.title}
                        </h4>

                        {/* DESCRIPTION */}
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {addon.description}
                        </p>

                        {/* META */}
                        <div className="flex justify-between items-center text-sm mb-4">
                          <span className="text-gray-500">
                            ⏱ {addon.duration || "Est. time"}
                          </span>
                          <span className="font-semibold text-white">
                            ${Number(addon.price).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* ACTION AREA */}
                      {!active ? (
                        <Button
                          onClick={() => toggleAddon({ ...addon, id })}
                          className="w-full"
                          variant="secondary"
                        >
                          Add Add-on
                        </Button>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {/* QUANTITY */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                              Quantity
                            </span>

                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                onClick={() => decrementAddon(id)}
                              >
                                <Minus size={14} />
                              </Button>

                              <span className="w-6 text-center font-semibold text-white">
                                {activeItem?.qty ?? 1}
                              </span>

                              <Button
                                size="icon"
                                onClick={() => incrementAddon(id)}
                              >
                                <Plus size={14} />
                              </Button>
                            </div>
                          </div>

                          {/* REMOVE */}
                          <Button
                            variant="outline"
                            onClick={() => toggleAddon({ id })}
                            className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* NAVIGATION */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("pickServices")}
                >
                  Back to Services
                </Button>

                <Button onClick={goToSummary} className="w-full sm:w-auto">
                  Continue to Summary
                </Button>
              </div>
            </section>
          )}

          {/* Summary */}
          {step === "summary" && (
            <section id="summary-section" className="mb-12 px-2 sm:px-0">
              <h3 className="text-2xl font-semibold mb-4">Summary</h3>

              <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg">
                {/* SERVICES */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Selected Services</h4>

                  <ul className="divide-y divide-gray-800">
                    {(booking.services || []).map((s) => (
                      <li key={s.id} className="py-4 last:border-none">
                        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] items-start md:items-center">
                          {/* INFO */}
                          <div className="min-w-0">
                            <div className="font-medium text-white">
                              {s.title}
                            </div>

                            {s.description && (
                              <div className="text-sm text-gray-400 line-clamp-2">
                                {s.description}
                              </div>
                            )}

                            <div className="text-sm text-gray-500 mt-1">
                              ⏱ {s.duration || "Est. time"}
                            </div>
                          </div>

                          {/* QUANTITY */}
                          <div className="flex items-center gap-2 justify-start md:justify-center">
                            <Button
                              size="icon"
                              onClick={() => decrementService(s.id)}
                            >
                              <Minus size={14} />
                            </Button>

                            <span className="w-6 text-center font-semibold">
                              {s.qty ?? 1}
                            </span>

                            <Button
                              size="icon"
                              onClick={() => incrementService(s.id)}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>

                          {/* PRICE + REMOVE */}
                          <div className="flex items-center justify-between md:justify-end gap-3">
                            <div className="font-semibold text-right">
                              $
                              {(
                                Number(s.price) * Math.max(1, s.qty || 1)
                              ).toFixed(2)}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => decrementService(s.id)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ADD-ONS */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Add-ons</h4>

                  <ul className="divide-y divide-gray-800">
                    {(booking.addons || []).map((a) => (
                      <li key={a.id} className="py-4 last:border-none">
                        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] items-start md:items-center">
                          {/* INFO */}
                          <div className="min-w-0">
                            <div className="text-gray-300 font-medium">
                              {a.title}
                            </div>

                            <div className="text-sm text-gray-500 mt-1">
                              ⏱ {a.duration || "Est. time"}
                            </div>
                          </div>

                          {/* QUANTITY */}
                          <div className="flex items-center gap-2 justify-start md:justify-center">
                            <Button
                              size="icon"
                              onClick={() => decrementAddon(a.id)}
                            >
                              <Minus size={14} />
                            </Button>

                            <span className="w-6 text-center font-semibold">
                              {a.qty ?? 1}
                            </span>

                            <Button
                              size="icon"
                              onClick={() => incrementAddon(a.id)}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>

                          {/* PRICE + REMOVE */}
                          <div className="flex items-center justify-between md:justify-end gap-3">
                            <div className="font-semibold text-right">
                              $
                              {(
                                Number(a.price) * Math.max(1, a.qty || 1)
                              ).toFixed(2)}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => decrementAddon(a.id)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* TOTALS */}
                <div className="border-t border-gray-800 pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Estimated Time</span>
                    <span>{formattedDurations.avg}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                <Button variant="outline" onClick={() => setStep("addons")}>
                  Back to Add-ons
                </Button>

                <Button
                  onClick={handleContinueToBooking}
                  disabled={!(booking.services && booking.services.length)}
                  className="w-full sm:w-auto"
                >
                  Continue to Booking
                </Button>
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
