// src/pages/HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CarModelViewer from "../components/ui/CarModelViewer";
import ProgressTracker from "../components/ProgressTracker";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import FloatingContact from "../components/FloatingContact"
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  Star,
  MapPin,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import heroBackground from "../assets/images/image-2.webp";
import image1 from "../assets/images/image-1.webp";
import image2 from "../assets/images/image-2.webp";
import image3 from "../assets/images/image-25.webp";
// import LiveReviews from "../components/LiveReviews";
import Logo from "../assets/images/logo-1.jpg";
import { Link } from "react-router-dom";


const HomePage = ({ onCarSelect }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
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
  ];

  const cars = [
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
  ];

  const handleCarSelect = (carType) => {
    if (onCarSelect) onCarSelect(carType);
    navigate("/services");
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % cars.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + cars.length) % cars.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F11] via-[#0E1417] to-[#0A0F11] text-white overflow-x-hidden">
      <Header />
      <FloatingContact/>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden sm:py-4 md:py-6 ">
        {/* Background Image with Smooth Zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center "
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/50" />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-6xl mx-auto "
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Logo */}
          <Link to="/" className="flex justify-center">
            <img
              src={Logo}
              alt="Precision Toronto Logo"
              className="w-40 md:w-44 h-auto mx-auto rounded-full shadow-lg sm:pt-5 md:pt-5 lg:pt-0"
            />
          </Link>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-2xl text-gray-300 tracking-wide">
            Luxury Auto Detailing Excellence
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 mt-12 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-2xl bg-black/50 border border-white/10 shadow-md hover:shadow-blue-500/30 hover:scale-105 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Icon className="w-10 h-10 text-blue-400 mx-auto mb-4" />
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

          {/* CTA Button */}
          <motion.button
            onClick={() =>
              document
                .getElementById("car-selection")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-xl transition-all sm:mb-7 lg:mb-0"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </section>
      {/* Progress Tracker */}
      <ProgressTracker currentStep={1} />

      {/* Car Selection */}
      <section
        id="car-selection"
        className="py-20 px-6 bg-gradient-to-b from-[#101518] to-[#0A0F11]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
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
              <motion.div
                key={car.type}
                className="rounded-2xl p-5 bg-white/5 backdrop-blur-md border border-white/10 shadow-lg hover:shadow-blue-400/20 hover:ring-2 hover:ring-cyan-400/30 transition cursor-pointer"
                onClick={() => handleCarSelect(car.type)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <CarModelViewer
                  modelPath={car.modelPath}
                  modelType={car.type}
                />
                <div className="text-center mt-5">
                  <h3 className="text-lg font-semibold">{car.label}</h3>
                  <p className="text-sm text-gray-400">{car.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile / Tablet Carousel */}
          <div className="block lg:hidden relative max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={cars[currentSlide].type}
                className="rounded-2xl p-6 bg-gradient-to-br from-[#1a1f23] to-[#101518] backdrop-blur-lg border border-white/10 shadow-xl transition cursor-pointer"
                onClick={() => handleCarSelect(cars[currentSlide].type)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-56 flex items-center justify-center">
                  <CarModelViewer
                    modelPath={cars[currentSlide].modelPath}
                    modelType={cars[currentSlide].type}
                  />
                </div>
                <div className="text-center mt-5">
                  <h3 className="text-xl font-semibold text-white">
                    {cars[currentSlide].label}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {cars[currentSlide].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Custom Controls */}
            <div className="flex items-center justify-between mt-6 relative">
              {/* Prev */}
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white shadow-lg backdrop-blur-md transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Pagination Dots */}
              <div className="flex gap-2 absolute left-1/2 -translate-x-1/2">
                {cars.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-3 h-3 rounded-full transition ${
                      idx === currentSlide ? "bg-blue-400" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Next */}
              <button
                onClick={nextSlide}
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
        {/* About Us */}
        <section className="py-20 px-6 relative">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left */}
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
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

            {/* Right Images */}
            <motion.div
              className="lg:w-1/2 grid grid-cols-2 gap-4 md:gap-6"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={image1}
                alt="Luxury detailing"
                className="w-full h-[260px] md:h-[280px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
              />
              <img
                src={image2}
                alt="Interior cleaning"
                className="w-full h-[260px] md:h-[280px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
              />
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-6 relative">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={image3}
                alt="Why Choose Us"
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl hover:scale-105 transition"
              />
            </motion.div>

            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
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
          <BeforeAfterSlider />
        </div>
      </section>

      {/* Reviews */}
      {/* <LiveReviews /> */}

      <Footer />
    </div>
  );
};

export default HomePage;
