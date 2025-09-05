import React, { useState } from "react";
import { MessageCircle, Phone, Instagram, X } from "lucide-react";
import { FaTiktok } from "react-icons/fa";


const FloatingContact = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contactOptions = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/16476857153",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/precision.to",
      color: "bg-[#DA2C71] hover:bg-pink-500",
    },
    {
      icon: FaTiktok,
      label: "Instagram",
      href: "https://www.tiktok.com/@precision.to",
      color: "bg-black hover:bg-gray-900",
    },
    {
      icon: Phone,
      label: "Call Us",
      href: "tel:+16476857153",
      color: "bg-blue-500 hover:bg-blue-600",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-slide-up">
          {contactOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <a
                key={index}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-12 h-12 rounded-full ${option.color} text-white shadow-luxury transition-all duration-300 hover:scale-110`}
                title={option.label}
              >
                <Icon className="w-6 h-6" />
              </a>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-blue-400 text-background shadow-luxury transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isExpanded ? "rotate-45" : ""
        }`}
        aria-label="Contact options"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default FloatingContact;
