import React, { useState, useEffect, useRef, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { PrefetchLink } from "../App";

// =================== Constants =================== //

const DESKTOP_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/connect", label: "Connect with Us" },
  { to: "/contact", label: "Contact Us" },
];

const MOBILE_LINKS = [
  { to: "/", label: "Home" },
  { to: "", state: { scrollTo: "car-selection" }, label: "Book Now" },
  { to: "", state: { scrollTo: "car-selection" }, label: "Pick a Service" },
  { to: "/connect", label: "Connect with Us" },
  { to: "", state: { scrollTo: "reviews" }, label: "Google Reviews" },
  { to: "/contact", label: "Contact Us" },
  { to: "/about", label: "About Us" },
];

const CONTACT_INFO = [
  { icon: Mail, text: "precisiontoronto@gmail.com" },
  { icon: MapPin, text: "Serving Greater Toronto Area" },
  { icon: Phone, text: "+1 647-685-7153" },
];

// =================== Animations =================== //

const headerVariants = {
  visible: { y: 0, transition: { duration: 0.3 } },
  hidden: { y: -110, transition: { duration: 0.3 } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -10 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

// =================== Helpers =================== //

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

// =================== Components =================== //

const NavLinkItem = memo(({ to, label, state, isActive, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();

    if (state?.scrollTo) {
      location.pathname === "/"
        ? scrollToSection(state.scrollTo)
        : navigate("/", { state });
    } else if (to) {
      navigate(to, { state });
    }

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`text-sm font-medium transition-colors whitespace-nowrap ${
        isActive ? "text-blue-400" : "text-gray-200 hover:text-blue-300"
      }`}
    >
      {label}
    </button>
  );
});

const ContactItem = memo(({ Icon, text }) => (
  <div className="flex items-center gap-2 whitespace-nowrap">
    <Icon className="w-4 h-4 text-blue-400" />
    <span className="text-xs">{text}</span>
  </div>
));

// =================== Hook =================== //

const useScrollDirection = (threshold = 80) => {
  const [show, setShow] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setShow(!(currentY > lastY.current && currentY > threshold));
      lastY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return show;
};

// =================== Header =================== //

const Header = memo(() => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const showHeader = useScrollDirection();

  const isActive = (path) => location.pathname === path;

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (location.state?.scrollTo) {
      scrollToSection(location.state.scrollTo);
    }
  }, [location]);

  return (
    <motion.header
      variants={headerVariants}
      animate={showHeader ? "visible" : "hidden"}
      className="sticky top-0 z-50 bg-[#0c0c0c] backdrop-blur-md border-b border-[#1F242C]"
    >
      {/* ===== Top Bar ===== */}
      <div className="hidden md:block bg-[#0c0c0c] border-b border-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2 flex items-center justify-between text-gray-300">
          <div className="flex items-center gap-4 lg:gap-6 overflow-hidden">
            {CONTACT_INFO.map((item) => (
              <ContactItem key={item.text} Icon={item.icon} text={item.text} />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[#FFD700] text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">4.9</span>
            </div>

            <div className="flex items-center gap-3 text-blue-400">
              <a
                href="https://www.instagram.com/precision.to"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="w-5 h-5 hover:scale-110 transition" />
              </a>
              <a
                href="https://wa.me/16476857153"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="w-5 h-5 hover:scale-110 transition" />
              </a>
              <a
                href="https://www.tiktok.com/@precision.to"
                target="_blank"
                rel="noreferrer"
              >
                <FaTiktok className="w-4 h-4 hover:scale-110 transition" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Header ===== */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img
            src="/logo.png"
            alt="logo"
            className="w-28 sm:w-32 object-contain"
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {DESKTOP_LINKS.map((link) => (
            <NavLinkItem
              key={link.label}
              {...link}
              isActive={isActive(link.to)}
            />
          ))}
        </div>

        {/* CTA + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <PrefetchLink to="/" className="hidden md:block">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="bg-blue-400 text-black text-sm font-medium px-5 py-2 rounded-lg shadow-md whitespace-nowrap"
            >
              Book Now
            </motion.button>
          </PrefetchLink>

          {/* Mobile Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md border border-[#2A2F36] hover:bg-[#1F242C] transition"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-blue-400" />
            ) : (
              <Menu className="w-6 h-6 text-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden absolute top-full left-0 w-full bg-[#14181E] border-t border-[#1F242C] shadow-xl"
          >
            <div className="px-5 py-6 space-y-6">
              <motion.ul className="space-y-5">
                {MOBILE_LINKS.map((link) => (
                  <motion.li key={link.label} variants={itemVariants}>
                    <NavLinkItem
                      {...link}
                      isActive={isActive(link.to)}
                      onClick={() => setMenuOpen(false)}
                    />
                  </motion.li>
                ))}
              </motion.ul>

              <div className="border-t border-[#1F242C] pt-5 space-y-4 text-gray-300">
                <div className="flex items-center gap-2 text-[#FFD700]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold">4.9/5 Google</span>
                </div>

                {CONTACT_INFO.slice(1).map((item) => (
                  <ContactItem
                    key={item.text}
                    Icon={item.icon}
                    text={item.text}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

export default Header;
