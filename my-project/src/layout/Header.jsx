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
  { icon: Mail, text: "precisiontoronto@gmail.com", color: "text-blue-400" },
  {
    icon: MapPin,
    text: "Serving Greater Toronto Area",
    color: "text-blue-400",
  },
  { icon: Phone, text: "+1 647-685-7153", color: "text-blue-400" },
];

const headerVariants = {
  visible: { y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  hidden: { y: -120, transition: { duration: 0.35, ease: "easeIn" } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// =================== Helpers =================== //

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: "smooth" });
};

// =================== Memoized Components =================== //

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
      className={`font-medium transition-colors ${
        isActive ? "text-blue-400" : "text-gray-200 hover:text-blue-300"
      }`}
    >
      {label}
    </button>
  );
});

const ContactItem = memo(({ Icon, text, color }) => (
  <div className="flex items-center gap-2">
    <Icon className={`w-4 h-4 ${color}`} />
    <span>{text}</span>
  </div>
));

// =================== Custom Hook =================== //

const useScrollDirection = (threshold = 80) => {
  const [show, setShow] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setShow(!(currentY > lastY.current && currentY > threshold));
          lastY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return show;
};

// =================== Header Component =================== //

const Header = memo(() => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const showHeader = useScrollDirection();

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Scroll if coming with state.scrollTo
  useEffect(
    () => location.state?.scrollTo && scrollToSection(location.state.scrollTo),
    [location]
  );

  return (
    <motion.header
      variants={headerVariants}
      animate={showHeader ? "visible" : "hidden"}
      className="bg-[#14181E]/95 backdrop-blur-md sticky top-0 z-50 shadow-md"
    >
      {/* Desktop Top Bar */}
      <div className="hidden md:block border-b border-[#1F242C]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-2 text-sm text-gray-300">
          <div className="flex items-center gap-6">
            {CONTACT_INFO.map(({ icon, text, color }) => (
              <ContactItem key={text} Icon={icon} text={text} color={color} />
            ))}
          </div>

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
              href="https://wa.me/16476857153"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform text-blue-400"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@precision.to"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform text-blue-400"
            >
              <FaTiktok className="w-4 h-4" />
            </a>
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
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-10">
            {DESKTOP_LINKS.map((link) => (
              <NavLinkItem
                key={link.label}
                {...link}
                isActive={isActive(link.to)}
              />
            ))}
          </nav>

          <PrefetchLink to="/" className="hidden md:block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-400 text-black px-5 py-2 mx-4 rounded-lg shadow-md"
            >
              Book Now
            </motion.button>
          </PrefetchLink>

          {/* Mobile Toggle */}
          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-md border border-[#2A2F36] hover:bg-[#FFD700]/10 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-blue-400" />
            ) : (
              <Menu className="w-6 h-6 text-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
});

export default Header;
