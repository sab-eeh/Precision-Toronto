import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  MessageCircle,
  Clock,
  Shield,
  Award,
  Users,
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#0F1518] text-gray-300 border-t border-[#1F242C]">
      {/* ===== Main Footer ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* ===== Company Info ===== */}
          <div className="space-y-5 max-w-sm">
            <div className="text-2xl font-bold leading-tight">
              <span className="text-blue-400">Precision</span>
              <span className="ml-2 text-white">Toronto</span>
            </div>

            <p className="text-sm leading-relaxed text-gray-400">
              Premier luxury auto detailing services in the Greater Toronto
              Area. Professional-grade care brought directly to your location.
            </p>

            <div className="flex items-center gap-3">
              {[
                {
                  icon: <Instagram className="w-5 h-5" />,
                  link: "https://www.instagram.com/precision.to",
                },
                {
                  icon: <MessageCircle className="w-5 h-5" />,
                  link: "https://wa.me/16476857153",
                },
                {
                  icon: <FaTiktok className="w-4 h-4" />,
                  link: "https://www.tiktok.com/@precision.to",
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A1F26] hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ===== Services ===== */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Services</h3>

            <ul className="space-y-2 text-sm">
              {[
                "Full Detailing",
                "Paint Correction",
                "Ceramic Coating",
                "Window Tinting",
                "Headlight Restoration",
              ].map((service, idx) => (
                <li key={idx}>
                  <button className="hover:text-blue-400 transition-colors text-left">
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== Contact ===== */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Contact</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className="leading-snug">+1 647-685-7153</span>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className="leading-snug">precisiontoronto@gmail.com</span>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className="leading-snug">
                  Greater Toronto Area
                  <br />
                  Mobile Service Available
                </span>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className="leading-snug">
                  Mon–Sat: 8AM–8PM
                  <br />
                  Sunday: By Appointment
                </span>
              </div>
            </div>
          </div>

          {/* ===== Trust Signals ===== */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Why Choose Us</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Fully Insured & Bonded</span>
              </div>

              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-blue-400" />
                <span>5-Star Google Reviews</span>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-400" />
                <span>500+ Satisfied Customers</span>
              </div>

              <div className="bg-[#1A1F26] p-4 rounded-xl mt-2">
                <div className="text-blue-400 font-semibold text-sm">
                  Satisfaction Guarantee
                </div>
                <div className="text-xs text-gray-400 mt-1 leading-relaxed">
                  100% satisfaction or we'll make it right.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="border-t border-[#1F242C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
            {/* Left */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
              <span>© 2024 Precision Toronto</span>

              <div className="flex items-center gap-4">
                <a
                  href="#privacy"
                  className="hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#terms"
                  className="hover:text-blue-400 transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-4 text-center">
              <span>Licensed Service</span>
              <div className="hidden sm:block w-1.5 h-1.5 bg-blue-400 rounded-full" />
              <span>Serving Toronto Since 2020</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
