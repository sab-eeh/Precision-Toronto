// src/pages/Gallery.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Title, Meta } from "react-head";

import Header from "../layout/Header";
import Footer from "../layout/Footer";
import FloatingContact from "../components/FloatingContact";
import GalleryImage from "../assets/images/image-10.webp";

// Before & After pairs
const beforeAfterPairs = [
  { before: "/gallery/before-1.jpg", after: "/gallery/after-1.jpg" },
  { before: "/gallery/before-2.jpg", after: "/gallery/after-2.jpg" },
  { before: "/gallery/before-3.jpg", after: "/gallery/after-3.jpg" },
];

// Video carousel sources
const videoSources = [
  "/videos/video-1.mp4",
  "/videos/video-2.mp4",
  "/videos/video-3.mp4",
];

const Gallery = () => {
  const [videoIndex, setVideoIndex] = useState(0);

  const prevVideo = () =>
    setVideoIndex((prev) => (prev === 0 ? videoSources.length - 1 : prev - 1));
  const nextVideo = () =>
    setVideoIndex((prev) => (prev === videoSources.length - 1 ? 0 : prev + 1));

  return (
    <>
      <Title>Gallery | Precision Toronto</Title>
      <Meta
        name="description"
        content="Explore our detailing gallery with videos, transformation before & after shots, and premium car care visuals."
      />

      <div className="bg-[#0B1315] text-gray-300 overflow-hidden">
        <Header />
        <FloatingContact />

        {/* Hero */}
        <section
          className="relative h-[80vh] flex items-center justify-center text-center bg-black"
          style={{
            backgroundImage: `url(${GalleryImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          <motion.div
            className="relative z-10 px-6 max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              Our <span className="text-blue-500">Gallery</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              See our detailing expertise in action — from immersive videos to
              stunning before & after transformations.
            </p>
          </motion.div>
        </section>

        {/* Video Gallery (Carousel for mobile/tablet, grid for desktop) */}
        <section className="container mx-auto px-6 py-20 relative">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-blue-400 text-center mb-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Immersive Video Highlights
          </motion.h2>
          <motion.p
            className="text-gray-400 text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Step into our world of premium detailing through captivating video
            stories. Watch as ordinary vehicles are transformed into showroom
            masterpieces — with precision, care, and unmatched expertise.
          </motion.p>

          {/* Carousel only for mobile/tablet */}
          <div className="md:hidden relative">
            <motion.div
              key={videoIndex}
              className="w-full overflow-hidden rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <video
                src={videoSources[videoIndex]}
                className="w-full h-[300px] object-cover"
                controls
                loop
                playsInline
                preload="metadata"
              />
            </motion.div>

            {/* Navigation Arrows */}
            <button
              onClick={prevVideo}
              className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextVideo}
              className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
            >
              <ChevronRight size={24} />
            </button>

            {/* Dots */}
            <div className="flex justify-center mt-4 gap-2">
              {videoSources.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setVideoIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === videoIndex ? "bg-blue-500 scale-125" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Grid layout only for desktop */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {videoSources.map((src, idx) => (
              <motion.div
                key={idx}
                className="overflow-hidden rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <video
                  src={src}
                  className="w-full h-[250px] lg:h-[500px] object-cover"
                  controls
                  loop
                  playsInline
                  preload="metadata"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Capturing Perfection */}
        <section className="container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-4">
              Capturing Perfection
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Every detail matters — from the shine of the body to the freshness
              of the interior. We capture the essence of your vehicle’s
              transformation through premium detailing.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Our work goes beyond cleaning — it’s about restoring beauty,
              preserving value, and creating a lasting impression. Whether it’s
              a luxury ride or a daily commuter, each vehicle receives the same
              precision and care to ensure it looks and feels its absolute best.
            </p>
            <p className="text-gray-400 leading-relaxed">
              From powerful exterior finishes that command attention to refined
              interiors that feel brand new, we make sure every angle of your
              vehicle tells a story of elegance, passion, and perfection.
            </p>
          </motion.div>

          <motion.div
            className="flex gap-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {[
              "/gallery/section-1.webp",
              "/gallery/section-2.webp",
            ].map((img, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden shadow-lg flex-1"
              >
                <img
                  src={img}
                  alt="Gallery showcase"
                  className="w-full h-72 object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        </section>

        {/* Before & After */}
        <section className="bg-[#0F1A1E] py-20">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-blue-400 text-center mb-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Before & After Transformations
          </motion.h2>
          <motion.p
            className="text-gray-400 text-center max-w-2xl mx-auto mb-12 px-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Experience the difference. Slide through the transformations that
            showcase how our detailing brings dull and tired vehicles back to
            life — making them shine like new again.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-6">
            {beforeAfterPairs.map((pair, idx) => (
              <motion.div
                key={idx}
                className="relative overflow-hidden rounded-xl shadow-lg group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                {/* Before image */}
                <img
                  src={pair.before}
                  alt="Before"
                  className="w-full h-64 md:h-72 lg:h-80 object-cover absolute inset-0 group-hover:opacity-0 transition-opacity duration-700"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                  Before
                </span>

                {/* After image */}
                <img
                  src={pair.after}
                  alt="After"
                  className="w-full h-64 md:h-72 lg:h-80 object-cover"
                  loading="lazy"
                />
                <span className="absolute top-3 right-3 bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 py-1 rounded-lg shadow-md z-10">
                  After
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="relative h-[60vh] flex items-center justify-center text-center bg-black"
          style={{
            backgroundImage: `url(/gallery/cta.jpeg)`,
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
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Car?
            </h2>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              Book your detailing appointment today and experience true
              precision.
            </p>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Gallery;
