import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import ProgressTracker from "../components/ProgressTracker";
import ServiceCard from "../components/ServiceCard";
import Button from "../components/ui/Button";

const servicesData = {
  sedan: [
    { title: "Interior Only", description: "Deep clean of all interior surfaces.", price: 150, features: ["Vacuum & shampoo", "Dashboard detail", "Windows"] },
    { title: "Interior + Exterior", description: "Complete detail inside & out.", price: 200, features: ["Interior detail", "Full exterior wash", "Wax protection"], popular: true },
    { title: "Stage 1 Paint Correction", description: "Machine polish & correction.", price: 399, features: ["Removes light swirls", "Restores gloss"] },
  ],
  suv: [
    { title: "Interior Only", description: "Deep clean of SUV interior.", price: 165, features: ["Vacuum & shampoo", "Dashboard detail", "Windows"] },
    { title: "Interior + Exterior", description: "Full SUV inside & out.", price: 225, features: ["Deep clean interior", "Full exterior wash", "Wax protection"], popular: true },
    { title: "Stage 1 Paint Correction", description: "Machine polish for SUV.", price: 399, features: ["Removes light swirls", "Restores gloss"] },
  ],
  truck: [
    { title: "Interior Only", description: "Heavy-duty truck interior detail.", price: 170, features: ["Vacuum & shampoo", "Dashboard detail", "Windows"] },
    { title: "Interior + Exterior", description: "Full truck interior & exterior.", price: 250, features: ["Deep clean interior", "Full exterior wash", "Wax protection"], popular: true },
    { title: "Stage 1 Paint Correction", description: "Machine polish for trucks.", price: 399, features: ["Removes light swirls", "Restores gloss"] },
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

const ServicesPage = ({ selectedCar }) => {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const availableServices = servicesData[selectedCar] || [];
  const availableAddons = addonsData[selectedCar] || [];

  // Toggle Services
  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  // Toggle Addons
  const toggleAddon = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]
    );
  };

  const totalPrice =
    selectedServices.reduce((sum, s) => sum + s.price, 0) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0);

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
                className={`p-5 rounded-2xl border transition shadow cursor-pointer ${
                  selectedAddons.includes(addon)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-800 hover:border-blue-400"
                }`}
                onClick={() => toggleAddon(addon)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold">{addon.title}</h4>
                  <Button
                    size="sm"
                    variant="default"
                    className={`px-3 py-1 rounded-lg text-white ${
                      selectedAddons.includes(addon) ? "bg-red-600" : "bg-blue-600"
                    }`}
                  >
                    {selectedAddons.includes(addon) ? "-" : "+"}
                  </Button>
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
              {selectedAddons.map((a, i) => (
                <li key={i} className="flex justify-between border-b py-2">
                  <span>{a.title}</span>
                  <span>${a.price}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 max-w-3xl mx-auto">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
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
