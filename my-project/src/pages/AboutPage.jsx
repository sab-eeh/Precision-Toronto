// src/pages/About.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

import Header from "../layout/Header";
import Footer from "../layout/Footer";
import FloatingContact from "../components/FloatingContact";
import { Title, Meta } from "react-head";

// Import all About page images from index.js
import {
  image1,
  image2,
  process1,
  process2,
  process3,
  galleryImages,
  bgHero,
  aboutImg,
  bgCTA,
} from "../assets/about";

const About = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );

  const handleNext = () =>
    setCurrentIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );

  return (
    <>
      <Title>About Precision Toronto | Car Cleaning & Detailing Experts</Title>
      <Meta
        name="description"
        content="Precision Toronto is a professional car cleaning and detailing company in Toronto, Canada. Founded by Haris, we provide premium auto detailing services for every car type."
      />

      <div className="bg-[#0B1315] text-gray-300 overflow-hidden">
        <Header />
        <FloatingContact />

        {/* Hero Section */}
        <section
          className="relative h-[80vh] flex items-center justify-center text-center"
          style={{
            backgroundImage: `url(${bgHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <motion.div
            className="relative z-10 max-w-3xl px-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              About - <span className="text-blue-500">Precision Toronto</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Crafting premium car care with passion, precision, and trust.
              Every detail matters — because your car deserves nothing less.
            </p>
          </motion.div>
        </section>

        {/* About Content */}
        <section className="container mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-blue-400 mb-4">
              Our Story & Mission
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              At Precision Toronto, we believe every vehicle is more than just
              transportation — it’s a passion, an identity, and a reflection of
              you. From luxury exotics to daily drivers, we bring expertise,
              premium products, and a commitment to excellence in every detail.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Our mission is to restore, protect, and elevate your car’s beauty
              while delivering a seamless, trusted experience. Precision is not
              just our name — it’s our promise.
            </p>
          </motion.div>

          <motion.div
            className="flex gap-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {[image1, image2].map((img, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden shadow-lg flex-1"
              >
                <img
                  src={img}
                  alt="About Precision Toronto"
                  className="w-full h-72 md:h-96 object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        </section>

        {/* Gallery Section */}
        <section className="bg-[#0F1A1E] py-20">
          <div className="container mx-auto px-6 text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-blue-400 mb-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Our Detailing Work
            </motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A glimpse of the artistry and dedication we bring to every
              project. From interiors to exteriors, we ensure your car shines
              with unmatched perfection.
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid container mx-auto px-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <motion.div
                key={idx}
                className="overflow-hidden rounded-xl shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <img
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden relative w-full max-w-md mx-auto">
            <motion.div
              key={currentIndex}
              className="overflow-hidden rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={galleryImages[currentIndex]}
                alt={`Gallery ${currentIndex + 1}`}
                className="w-full h-80 object-cover"
                loading="lazy"
              />
            </motion.div>

            {/* Controls */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <button
                onClick={handlePrev}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 shadow-md transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 shadow-md transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Precision Toronto is more than just detailing. It’s about trust,
              transformation, and timeless care. We aim to give you not just a
              service, but an experience that redefines your car’s presence.
            </p>
            <ul className="space-y-3 text-gray-300">
              {[
                "Premium products & advanced techniques",
                "Experienced, passionate professionals",
                "Tailored solutions for every vehicle",
                "100% satisfaction guarantee",
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" /> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={aboutImg}
                alt="Why Choose Us"
                className="w-full h-80 md:h-[28rem] object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </section>

        {/* Process Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-blue-400 text-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Detailing Process
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                img: process1,
                title: "Step 1: Deep Cleaning",
                desc: "Thorough exterior wash and interior prep to remove dirt, dust, and grime.",
              },
              {
                img: process2,
                title: "Step 2: Restoration",
                desc: "Paint correction, polishing, and treatments to revive your car’s finish.",
              },
              {
                img: process3,
                title: "Step 3: Protection",
                desc: "Ceramic coating & detailing to keep your vehicle protected and shining longer.",
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="bg-[#111A1F] rounded-xl shadow-lg overflow-hidden hover:shadow-blue-500/20 transition"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-52 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="relative h-[70vh] flex items-center justify-center text-center"
          style={{
            backgroundImage: `url(${bgCTA})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <motion.div
            className="relative z-10 px-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Experience True Precision
            </h2>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              Elevate your car’s presence with professional detailing that’s
              tailored, trusted, and timeless.
            </p>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default About;
