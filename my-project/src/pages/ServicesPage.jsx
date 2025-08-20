import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import ProgressTracker from "../components/ProgressTracker";
import ServiceCard from "../components/ServiceCard";
import Button from "../components/ui/Button";
import { Plus, Minus } from "lucide-react";

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
};

const ServicesPage = ({ selectedCar, onBack }) => {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});

  const availableServices = servicesData[selectedCar] || [];
  const availableAddons = addonsData[selectedCar] || [];

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const changeAddonQty = (addon, delta) => {
    setSelectedAddons((prev) => {
      const newQty = (prev[addon.title] || 0) + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[addon.title];
        return copy;
      }
      return { ...prev, [addon.title]: newQty };
    });
  };

  const totalPrice =
    selectedServices.reduce((sum, s) => sum + s.price, 0) +
    Object.entries(selectedAddons).reduce(
      (sum, [title, qty]) =>
        sum + qty * availableAddons.find((a) => a.title === title).price,
      0
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ProgressTracker currentStep={2} />
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Choose Your Service</h2>
            <p className="text-lg text-gray-400">
              Select services and add-ons for your{" "}
              <span className="font-semibold">{selectedCar}</span>.
            </p>
          </div>

          {/* Services */}
          <h3 className="text-2xl font-semibold mb-6">Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {availableServices.map((service, index) => (
              <ServiceCard
                key={index}
                {...service}
                selected={selectedServices.includes(service)}
                onToggle={() => toggleService(service)}
              />
            ))}
          </div>

          {/* Add-ons */}
          <h3 className="text-2xl font-semibold mb-6">Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {availableAddons.map((addon, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border transition bg-white text-gray-800 shadow hover:border-blue-400"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold">{addon.title}</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => changeAddonQty(addon, -1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-6 text-center">
                      {selectedAddons[addon.title] || 0}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => changeAddonQty(addon, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">${addon.price}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 shadow-lg mb-12">
            <h3 className="text-2xl font-semibold mb-4">Summary</h3>
            <ul className="mb-4">
              {selectedServices.map((s, i) => (
                <li key={i} className="flex justify-between border-b py-2">
                  <span>{s.title}</span>
                  <span>${s.price}</span>
                </li>
              ))}
              {Object.entries(selectedAddons).map(([title, qty], i) => {
                const addon = availableAddons.find((a) => a.title === title);
                return (
                  <li key={i} className="flex justify-between border-b py-2">
                    <span>
                      {title} x {qty}
                    </span>
                    <span>${(addon.price * qty).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 max-w-3xl mx-auto">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button
              variant="default"
              disabled={selectedServices.length === 0}
              onClick={() =>
                navigate("/booking", {
                  state: { selectedCar, selectedServices, selectedAddons, totalPrice },
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
