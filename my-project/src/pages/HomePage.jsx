import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CarModelViewer from "../components/ui/CarModelViewer";
import ProgressTracker from "../components/ProgressTracker";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { Star, MapPin, Clock, Shield } from "lucide-react";
import heroBackground from "../assets/hero-bg.jpg";
import image1 from "../assets/image-1.jpg";
import image2 from "../assets/image-2.jpg";
import image3 from "../assets/image-3.jpg";
import LiveReviews from "../components/LiveReviews";

const HomePage = ({ onCarSelect }) => {
  const navigate = useNavigate();

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
    if (onCarSelect) {
      onCarSelect(carType);
    }
    navigate("/services");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F11] via-[#0E1417] to-[#0A0F11] text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 animate-slow-zoom"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90 " />

        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-wide">
            <span className="text-blue-400 drop-shadow-lg italic">
              PRECISION
            </span>
            <br />
            <span className="text-white italic">TORONTO</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 tracking-wide">
            Luxury Auto Detailing Excellence
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 mb-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-2xl bg-white/10 border border-white/10 shadow-md hover:shadow-blue-500/20 hover:scale-101 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Icon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-sm text-blue-400 uppercase tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Get Started Button */}
          <motion.button
            onClick={() =>
              document
                .getElementById("car-selection")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="mt-2 px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
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
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4 tracking-wide">
              Choose Your Vehicle
            </h2>
            <p className="text-lg text-gray-400">
              Select your vehicle to see customized services and pricing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
        </div>
      </section>

      {/* About & Why Choose Us Section */}
      <section className="bg-gradient-to-b from-[#0F1518] to-[#0A0F11]">
        {/* About Us */}
        <section className="py-20 px-6 relative">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
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
              className="lg:w-1/2 grid grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src={image1}
                alt="Luxury detailing"
                className="w-full h-[280px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
              />
              <img
                src={image2}
                alt="Interior cleaning"
                className="w-full h-[280px] object-cover rounded-2xl shadow-lg hover:scale-105 transition"
              />
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-6 relative">
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
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
      <LiveReviews />

      <Footer />
    </div>
  );
};

export default HomePage;
