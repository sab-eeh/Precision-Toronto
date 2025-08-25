// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  MessageCircle,
  Star,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Logo copy.png";

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/About", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/gallery", label: "Gallery" },
    { to: "/Contact", label: "Contact" },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(!(currentScrollY > lastScrollY && currentScrollY > 80));
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: showHeader ? 0 : -150 }}
      transition={{ duration: 0.3 }}
      className="bg-[#14181E]/95 backdrop-blur-md sticky top-0 z-50 shadow-md"
    >
      {/* Top Bar (Desktop Only) */}
      <div className="hidden md:block border-b border-[#1F242C]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm text-gray-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>info@precisiontoronto.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Serving Greater Toronto Area</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>(416) 123-4567</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[#FFD700]">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">4.9/5</span>
                <span className="text-gray-400">Google Reviews</span>
              </div>
              <a
                href="https://www.instagram.com/precision.to"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform text-blue-400"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/14161234567"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform text-blue-400"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 flex items-center justify-between py-3">
        <Link to="/" className="flex items-center">
          <img
            src={Logo}
            alt="Precision Toronto Logo"
            className="w-28 h-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`font-medium transition-colors ${
                isActive(link.to)
                  ? "text-blue-400"
                  : "text-gray-200 hover:text-blue-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Link to="/booking" className="hidden md:block">
            <button className="bg-blue-400 text-black px-5 py-2 rounded-lg shadow-md transition-transform hover:scale-105">
              Book Now
            </button>
          </Link>
          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-md border border-[#2A2F36] hover:bg-[#FFD700]/10 transition"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-blue-400" />
            ) : (
              <Menu className="w-5 h-5 text-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden w-full bg-[#14181E] border-t border-[#1F242C] shadow-lg absolute left-0 z-50"
          >
            <div className="px-6 py-4">
              {/* <div className="flex justify-center mb-4">
                <img
                  src={Logo}
                  alt="Precision Toronto Logo"
                  className="w-24 h-auto"
                />
              </div> */}

              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`font-medium transition-colors ${
                        isActive(link.to)
                          ? "text-blue-400"
                          : "text-gray-200 hover:text-blue-300"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#1F242C] mt-4 space-y-3 text-gray-300">
                
                <div className="flex items-center gap-2 text-[#FFD700]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-gray-400">Google Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>(416) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Serving Greater Toronto Area</span>
                </div>
              </div>

              <Link to="/booking" onClick={() => setMenuOpen(false)}>
                <button className="bg-blue-400 text-black w-full mt-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform">
                  Book Now
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
