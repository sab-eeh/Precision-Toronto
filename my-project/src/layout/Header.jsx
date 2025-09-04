// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
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


// ✅ Nav Links (outside component to prevent re-creation)
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/About", label: "About Us" },
  { to: "/Gallery", label: "Gallery" },
  { to: "/Contact", label: "Contact Us" },
];

// ✅ Contact Info for reusability
const CONTACT_INFO = [
  {
    icon: Mail,
    text: "info@precisiontoronto.com",
    color: "text-blue-400",
  },
  {
    icon: MapPin,
    text: "Serving Greater Toronto Area",
    color: "text-blue-400",
  },
  { icon: Phone, text: "(416) 123-4567", color: "text-blue-400" },
];

// ✅ Animation Variants
const headerVariants = {
  visible: { y: 0, transition: { duration: 0.4, ease: "easeInOut" } },
  hidden: { y: -120, transition: { duration: 0.4, ease: "easeInOut" } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const Header = React.memo(() => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const isActive = (path) => location.pathname === path;

  // ✅ Optimized scroll handler with requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
            setShowHeader(false); // hide on scroll down
          } else {
            setShowHeader(true); // show on scroll up
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      variants={headerVariants}
      animate={showHeader ? "visible" : "hidden"}
      className="bg-[#14181E]/95 backdrop-blur-md sticky top-0 z-50 shadow-md"
    >
      {/* Top Bar (Desktop) */}
      <div className="hidden md:block border-b border-[#1F242C]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-2 text-sm text-gray-300">
            {/* Left: Contact Info */}
            <div className="flex items-center gap-6">
              {CONTACT_INFO.map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Right: Reviews + Social */}
            <div className="flex items-center gap-5">
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
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/logo.webp"
            alt="Precision Toronto Logo"
            className="w-28 h-auto mx-auto rounded-full shadow-lg"
            loading="lazy"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
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
        <div className="flex items-center gap-4">
          <Link to="/" className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-400 text-black px-5 py-2 rounded-lg shadow-md"
            >
              Book Now
            </motion.button>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-md border border-[#2A2F36] hover:bg-[#FFD700]/10 transition"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-blue-400" />
            ) : (
              <Menu className="w-6 h-6 text-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden w-full bg-[#14181E] border-t border-[#1F242C] shadow-lg absolute left-0 z-40"
          >
            <div className="px-6 py-6 space-y-6">
              <ul className="space-y-5">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`block font-medium text-lg transition-colors ${
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

              {/* Contact Info (reused) */}
              <div className="pt-6 border-t border-[#1F242C] space-y-4 text-gray-300">
                <div className="flex items-center gap-2 text-[#FFD700]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-gray-400">Google Reviews</span>
                </div>
                {CONTACT_INFO.slice(-2).map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <Link to="/" onClick={() => setMenuOpen(false)}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-400 text-black w-full py-2 rounded-lg shadow-md"
                >
                  Book Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

export default Header;
