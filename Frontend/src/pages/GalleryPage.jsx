// src/pages/Gallery.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Instagram, Video } from "lucide-react";
import { Title, Meta } from "react-head";

import Header from "../layout/Header";
import Footer from "../layout/Footer";
import FloatingContact from "../components/FloatingContact";

import { galleryHero, posts, videoSources } from "../assets/gallery";

// 👇 Add Instagram posts manually
const instagramPosts = [
  {
    id: 1,
    media_url: posts[0],
    permalink:
      "https://www.instagram.com/p/DLs2daFyxvl/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
  },
  {
    id: 2,
    media_url: posts[1],
    permalink:
      "https://www.instagram.com/p/DLGKVuxSPte/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
  },
  {
    id: 3,
    media_url: posts[2],
    permalink:
      "https://www.instagram.com/p/DJS3joUR1iM/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA",
  },
];

const Gallery = () => {
  const [videoIndex, setVideoIndex] = useState(0);

  const prevVideo = () =>
    setVideoIndex((prev) => (prev === 0 ? videoSources.length - 1 : prev - 1));
  const nextVideo = () =>
    setVideoIndex((prev) => (prev === videoSources.length - 1 ? 0 : prev + 1));

  return (
    <>
      <Title>Connect With Us | Precision Toronto</Title>
      <Meta
        name="description"
        content="Explore our detailing videos, before & after transformations, and premium car care visuals."
      />

      <div className="bg-[#0B1315] text-gray-300 overflow-hidden">
        <Header />
        <FloatingContact />

        {/* Hero Section */}
        <section
          className="relative h-[80vh] flex items-center justify-center text-center"
          style={{
            backgroundImage: `url(${galleryHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/50" />
          <motion.div
            className="relative z-10 px-6 max-w-3xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              <span className="text-blue-500">Connect with us</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              See our detailing expertise in action — from immersive videos to
              stunning before & after transformations.
            </p>
          </motion.div>
        </section>

        {/* Instagram Posts */}
        <section className="container mx-auto px-6 py-20">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-pink-500 text-center mb-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Latest Instagram Posts
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {instagramPosts.map((post) => (
              <motion.a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl overflow-hidden shadow-lg group relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={post.media_url}
                  alt="Instagram post"
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Instagram className="w-10 h-10 text-white" />
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/precision.to/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg shadow transition"
            >
              <Instagram size={20} />
              Follow Us on Instagram
            </a>
          </div>
        </section>

        {/* TikTok Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-blue-400 text-center mb-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            TikTok Highlights
          </motion.h2>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoSources.slice(0, 6).map((src, idx) => (
              <motion.div
                key={idx}
                className="overflow-hidden rounded-xl shadow-lg relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <video
                  src={src}
                  className="w-full aspect-[9/16] object-cover"
                  controls
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden relative mt-8">
            <motion.div
              key={videoIndex}
              className="w-full overflow-hidden rounded-xl shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <video
                src={videoSources[videoIndex]}
                className="w-full aspect-[9/16] object-cover"
                controls
                loop
                playsInline
                preload="metadata"
              />
            </motion.div>
            <button
              onClick={prevVideo}
              className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/50 p-2 rounded-full text-white"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextVideo}
              className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/50 p-2 rounded-full text-white"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.tiktok.com/@precision.to"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
            >
              <Video size={20} />
              Watch More on TikTok
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Gallery;
