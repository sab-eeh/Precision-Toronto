import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import ProgressTracker from "../components/ProgressTracker";
import ServiceCard from "../components/ServiceCard";
import Button from "../components/ui/Button";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Centralized data
const servicesData = {
  sedan: [
    {
      title: "Interior Only",
      description: "Deep clean of all interior surfaces.",
      price: 150,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
    },
    {
      title: "Interior + Exterior",
      description: "Complete detail inside & out.",
      price: 200,
      features: ["Interior detail", "Full exterior wash", "Wax protection"],
      popular: true,
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Machine polish & correction.",
      price: 399,
      features: ["Removes light swirls", "Restores gloss"],
    },
  ],
  suv: [
    {
      title: "Interior Only",
      description: "Deep clean of SUV interior.",
      price: 165,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
    },
    {
      title: "Interior + Exterior",
      description: "Full SUV inside & out.",
      price: 225,
      features: ["Deep clean interior", "Full exterior wash", "Wax protection"],
      popular: true,
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Machine polish for SUV.",
      price: 399,
      features: ["Removes light swirls", "Restores gloss"],
    },
  ],
  truck: [
    {
      title: "Interior Only",
      description: "Heavy-duty truck interior detail.",
      price: 170,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
    },
    {
      title: "Interior + Exterior",
      description: "Full truck interior & exterior.",
      price: 250,
      features: ["Deep clean interior", "Full exterior wash", "Wax protection"],
      popular: true,
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Machine polish for trucks.",
      price: 399,
      features: ["Removes light swirls", "Restores gloss"],
    },
  ],
  coupe: [
    {
      title: "Interior Only",
      description: "Luxury coupe interior deep clean.",
      price: 140,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
    },
    {
      title: "Interior + Exterior",
      description: "Premium coupe full detail.",
      price: 190,
      features: ["Interior detail", "Hand wash", "Wax protection"],
      popular: true,
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Polish & paint correction for coupes.",
      price: 380,
      features: ["Removes light swirls", "Restores gloss"],
    },
  ],
};

const addonsData = {
  sedan: [
    { title: "Extra Paint Correction Stage", price: 150 },
    { title: "Ceramic Coating", price: 800 },
    { title: "Window Tinting", price: 249 },
    { title: "Headlight Restoration", price: 79.99 },
  ],
  suv: [
    { title: "Extra Paint Correction Stage", price: 150 },
    { title: "Ceramic Coating", price: 800 },
    { title: "Window Tinting", price: 300 },
    { title: "Headlight Restoration", price: 79.99 },
  ],
  truck: [
    { title: "Extra Paint Correction Stage", price: 150 },
    { title: "Ceramic Coating", price: 800 },
    { title: "Headlight Restoration", price: 79.99 },
  ],
  coupe: [
    { title: "Extra Paint Correction Stage", price: 120 },
    { title: "Ceramic Coating", price: 750 },
    { title: "Window Tinting", price: 200 },
    { title: "Headlight Restoration", price: 70 },
  ],
};

const ServicesPage = ({ selectedCar }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Find element with that id
      const element = document.getElementById(location.hash.replace("#", ""));
      if (element) {
        // Browser default jump (no smooth scroll)
        element.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [location]);
  const navigate = useNavigate();
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

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce((sum, s) => sum + s.price, 0) +
      selectedAddons.reduce((sum, a) => sum + a.price, 0),
    [selectedServices, selectedAddons]
  );

  return (
    <div   id="CarServices" className="min-h-screen bg-gradient-to-b from-[#0A0F11] to-[#101518] text-white">
      <Header />
      <ProgressTracker currentStep={2} />
      {/* Back Button */}
      <div
        className="max-w-6xl mx-auto px-6 mt-6 flex items-center gap-2"
      >
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
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Choose Your Service</h2>
            <p className="text-lg text-gray-400">
              Professional detailing services tailored to your{" "}
              <span className="font-semibold capitalize">{selectedCar}</span>.
            </p>
          </motion.div>

          {/* Services */}
          <h3 className="text-2xl font-semibold mb-6">Services</h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {availableServices.map((service, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ServiceCard
                  {...service}
                  selected={selectedServices.includes(service)}
                  onToggle={() => toggleService(service)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Add-ons */}
          <h3 className="text-2xl font-semibold mb-6">Add-ons</h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {availableAddons.map((addon, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                onClick={() => toggleAddon(addon)}
                className={`p-5 rounded-2xl border transition shadow-lg cursor-pointer ${
                  selectedAddons.includes(addon)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-800 text-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold">{addon.title}</h4>
                  <Button
                    size="sm"
                    variant="default"
                    className={`px-3 py-1 rounded-lg ${
                      selectedAddons.includes(addon)
                        ? "bg-red-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {selectedAddons.includes(addon) ? "-" : "+"}
                  </Button>
                </div>
                <p className="text-sm">${addon.price}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div
            className="bg-gray-900 rounded-2xl p-8 shadow-lg mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
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
    </div>
  );
};

export default ServicesPage;
