import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Title, Meta } from "react-head";

// Lazy-loaded components for faster initial load
const Header = lazy(() => import("../layout/Header"));
const Footer = lazy(() => import("../layout/Footer"));
const ProgressTracker = lazy(() => import("../components/ProgressTracker"));
const ServiceCard = lazy(() => import("../components/ServiceCard"));
const Button = lazy(() => import("../components/ui/Button"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));

import { servicesData, addonsData } from "../data/servicesData";

const ServicesPage = ({ selectedCar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace("#", ""));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const availableServices = useMemo(
    () => servicesData[selectedCar] || [],
    [selectedCar]
  );
  const availableAddons = useMemo(
    () => addonsData[selectedCar] || [],
    [selectedCar]
  );

  const toggleService = useCallback(
    (service) => {
      setSelectedServices((prev) =>
        prev.includes(service)
          ? prev.filter((s) => s !== service)
          : [...prev, service]
      );
    },
    [setSelectedServices]
  );

  const toggleAddon = useCallback(
    (addon) => {
      setSelectedAddons((prev) =>
        prev.includes(addon)
          ? prev.filter((a) => a !== addon)
          : [...prev, addon]
      );
    },
    [setSelectedAddons]
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce((sum, s) => sum + s.price, 0) +
      selectedAddons.reduce((sum, a) => sum + a.price, 0),
    [selectedServices, selectedAddons]
  );

  return (
    <>
      <Title>Car Detailing Services | Precision Toronto</Title>
      <Meta
        name="description"
        content="Explore Precision Toronto’s car detailing services: interior cleaning, exterior polish, ceramic coating, and paint protection in Toronto, Canada."
      />

      <div className="min-h-screen bg-gradient-to-b from-[#0A0F11] to-[#101518] text-white">
        <Suspense
          fallback={<div className="p-6 text-gray-400">Loading...</div>}
        >
          <Header />
          <FloatingContact />
          <ProgressTracker currentStep={2} />

          {/* Back Button */}
          <div className="max-w-6xl mx-auto px-6 mt-6 flex items-center gap-2">
            <Button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
          </div>

          <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              {/* Heading */}
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl font-bold mb-4">Choose Your Service</h2>
                <p className="text-lg text-gray-400">
                  Professional detailing services tailored to your{" "}
                  <span className="font-semibold capitalize">
                    {selectedCar}
                  </span>
                  .
                </p>
              </motion.div>

              {/* Services */}
              <h3 className="text-2xl font-semibold mb-6">Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {availableServices.map((service, index) => (
                  <ServiceCard
                    key={index}
                    {...service}
                    selected={selectedServices.includes(service)}
                    onToggle={() => toggleService(service)}
                    // 👇 Add lazy loading to service card images
                    imageProps={{ loading: "lazy" }}
                  />
                ))}
              </div>

              {/* Add-ons */}
              <h3 className="text-2xl font-semibold mb-6">Add-ons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {availableAddons.map((addon, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03 }}
                    className={`p-5 rounded-2xl border transition shadow-lg cursor-pointer ${
                      selectedAddons.includes(addon)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-800 text-gray-200 hover:border-blue-400"
                    }`}
                    onClick={() => toggleAddon(addon)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold">{addon.title}</h4>
                      <span className="font-bold">${addon.price}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <motion.div
                className="bg-gray-900 rounded-2xl p-8 shadow-lg mb-12"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-2xl font-semibold mb-4">Summary</h3>
                <ul className="mb-4 divide-y divide-gray-700">
                  {selectedServices.map((s, i) => (
                    <li key={i} className="flex justify-between py-2">
                      <span>{s.title}</span>
                      <span>${s.price}</span>
                    </li>
                  ))}
                  {selectedAddons.map((a, i) => (
                    <li key={i} className="flex justify-between py-2">
                      <span>{a.title}</span>
                      <span>${a.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="flex justify-end mt-10 max-w-3xl mx-auto">
                <Button
                  variant="default"
                  disabled={selectedServices.length === 0}
                  onClick={() =>
                    navigate("/booking", {
                      state: {
                        selectedCar,
                        selectedServices,
                        selectedAddons,
                        totalPrice,
                      },
                    })
                  }
                >
                  Continue to Booking
                </Button>
              </div>
            </div>
          </section>

          <Footer />
        </Suspense>
      </div>
    </>
  );
};

export default ServicesPage;
