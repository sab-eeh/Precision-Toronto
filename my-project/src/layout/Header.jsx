import React, { useState, useEffect, useRef, memo } from "react";
import { useLocation } from "react-router-dom";
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
import { FaTiktok } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { PrefetchLink } from "../App"; // ✅ import PrefetchLink

// ✅ Nav Links
const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact Us" },
];

// ✅ Contact Info
const CONTACT_INFO = [
  { icon: Mail, text: "precisiontoronto@gmail.com", color: "text-blue-400" },
  {
    icon: MapPin,
    text: "Serving Greater Toronto Area",
    color: "text-blue-400",
  },
  { icon: Phone, text: "+1 647-685-7153", color: "text-blue-400" },
];

// ✅ Animation Variants
const headerVariants = {
  visible: { y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  hidden: { y: -120, transition: { duration: 0.35, ease: "easeIn" } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// ✅ Memoized components
const NavLinkItem = memo(({ to, label, isActive, onClick }) => (
  <PrefetchLink
    to={to}
    onClick={onClick}
    className={`font-medium transition-colors ${
      isActive ? "text-blue-400" : "text-gray-200 hover:text-blue-300"
    }`}
  >
    {label}
  </PrefetchLink>
));

const ContactItem = memo(({ Icon, text, color }) => (
  <div className="flex items-center gap-2">
    <Icon className={`w-4 h-4 ${color}`} />
    <span>{text}</span>
  </div>
));

const Header = memo(() => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const isActive = (path) => location.pathname === path;

  // ✅ Auto-close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ✅ Optimized scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setShowHeader(
            !(currentScrollY > lastScrollY.current && currentScrollY > 80)
          );
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
                <ContactItem key={text} Icon={Icon} text={text} color={color} />
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
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform text-blue-400"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/16476857153"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform text-blue-400"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@precision.to"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform text-blue-400"
              >
                <FaTiktok className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-2">
        {/* Logo */}
        <PrefetchLink to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Precision Toronto Logo"
            className="w-36 h-auto mx-auto rounded-full shadow-lg"
            loading="lazy"
          />
        </PrefetchLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <NavLinkItem
              key={link.label}
              {...link}
              isActive={isActive(link.to)}
            />
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <PrefetchLink to="/" className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-400 text-black px-5 py-2 rounded-lg shadow-md"
            >
              Book Now
            </motion.button>
          </PrefetchLink>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle menu"
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
              <motion.ul
                className="space-y-5"
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {NAV_LINKS.map((link) => (
                  <motion.li key={link.label} variants={itemVariants}>
                    <NavLinkItem
                      {...link}
                      isActive={isActive(link.to)}
                      onClick={() => setMenuOpen(false)}
                    />
                  </motion.li>
                ))}
              </motion.ul>

              {/* Contact Info */}
              <div className="pt-6 border-t border-[#1F242C] space-y-4 text-gray-300">
                <div className="flex items-center gap-2 text-[#FFD700]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-gray-400">Google Reviews</span>
                </div>
                {CONTACT_INFO.slice(-2).map(({ icon: Icon, text, color }) => (
                  <ContactItem
                    key={text}
                    Icon={Icon}
                    text={text}
                    color={color}
                  />
                ))}
              </div>

              <PrefetchLink to="/" onClick={() => setMenuOpen(false)}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-400 text-black w-full py-2 rounded-lg shadow-md"
                >
                  Book Now
                </motion.button>
              </PrefetchLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

export default Header;
