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
    <footer className="bg-[#0F1518] text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="text-2xl font-bold">
              <span className="text-blue-400">Precision</span>
              <span className="ml-2 text-white">Toronto</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Premier luxury auto detailing services in the Greater Toronto
              Area. Professional-grade care brought directly to your location.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/precision.to"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/16476857153"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@precision.to"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-md"
              >
                <FaTiktok className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Services</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Basic Wash & Dry",
                "Full Detail Package",
                "Ceramic Coating",
                "Interior Deep Clean",
                "Paint Correction",
                "Mobile Service",
              ].map((service, idx) => (
                <li key={idx}>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+1 647-685-7153</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>precisiontoronto@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>
                  Greater Toronto Area
                  <br />
                  Mobile Service Available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>
                  Mon-Sat: 8AM-6PM
                  <br />
                  Sunday: By Appointment
                </span>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
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
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <div className="text-blue-400 font-semibold">
                  Satisfaction Guarantee
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  100% satisfaction or we'll make it right.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0F1518] border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-500">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <span>© 2024 Precision Toronto. All rights reserved.</span>
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
                Terms of Service
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <span>Licensed Auto Detailing Service</span>
              <div className="hidden sm:block w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Serving Toronto Since 2020</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
