// src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

// Sample placeholder images (replace with your own detailing images)
import aboutImg from "../assets/hero-bg.jpg";
import process1 from "../assets/process1.jpg";
import process2 from "../assets/process2.jpg";
import process3 from "../assets/process3.jpg";
import gallery1 from "../assets/image-1.jpg";
import gallery2 from "../assets/image-8.jpg";
import gallery3 from "../assets/image-10.jpg";
import gallery4 from "../assets/image-4.jpg";
import gallery5 from "../assets/image-12.jpg";
import gallery6 from "../assets/image-6.jpg";
import gallery7 from "../assets/image-7.jpg";
import gallery8 from "../assets/image-3.jpg";
import bgHero from "../assets/hero-bg.jpg";
import bgCTA from "../assets/cta-bg.jpg";

const About = () => {
  return (
    <div className="bg-[#0B1315] text-gray-300">
      <Header />

      {/* Hero Section */}
      <section
        className="relative h-[80vh] flex items-center justify-center text-center"
        style={{
          backgroundImage: `url(${bgHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          className="relative z-10 max-w-3xl px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            About <span className="text-blue-500">Precision Toronto</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Passion for perfection, dedication to detail, and trusted care for
            your car.
          </p>
        </motion.div>
      </section>

      {/* About Content Section */}
      <section className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-blue-400 mb-4">
            Our Story & Mission
          </h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            At Precision Toronto, we believe every vehicle deserves meticulous
            care. From luxury supercars to daily drivers, we bring expertise,
            premium products, and passion to every detail. Our mission is
            simple: to restore, protect, and elevate your car’s beauty—while
            delivering a seamless experience.
          </p>
          <p className="text-gray-400 leading-relaxed">
            We’ve built our reputation by combining advanced techniques with
            personalized service, ensuring every car leaves with a flawless
            finish and every client leaves with complete satisfaction.
          </p>
        </motion.div>

        {/* Right Images (stacked vertically) */}
        <motion.div
          className="flex gap-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={gallery8}
              alt="About Precision Toronto - Image 1"
              className="w-full h-72 md:h-96 object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={gallery7}
              alt="About Precision Toronto - Image 2"
              className="w-full h-72 md:h-96 object-cover"
            />
          </div>
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
            A glimpse into the precision and passion behind every detail. From
            interiors to exteriors, we make sure your car shines inside and out.
          </p>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[gallery1, gallery2, gallery3, gallery4, gallery5, gallery6].map(
            (img, idx) => (
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
                />
              </motion.div>
            )
          )}
        </div>
      </section>

      {/* New Context Section */}
      <section className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Text */}
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
            Beyond just detailing, Precision Toronto is about trust,
            transparency, and transformation. We don’t just work on cars — we
            craft experiences that leave lasting impressions.
          </p>
          <ul className="space-y-3 text-gray-300">
            <li>✔️ Premium products & advanced techniques</li>
            <li>✔️ Experienced and passionate detailing experts</li>
            <li>✔️ Tailored solutions for every vehicle type</li>
            <li>✔️ Customer-first service with guaranteed satisfaction</li>
          </ul>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={aboutImg}
              alt="Why Choose Precision Toronto"
              className="w-full h-80 md:h-[28rem] object-cover"
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

      {/* CTA Section */}
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
          <p className="text-lg text-gray-300">
            Elevate your car’s beauty with our professional detailing services.
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
