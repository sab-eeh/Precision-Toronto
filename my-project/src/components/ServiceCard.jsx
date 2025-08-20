import React from "react";
import Button from "../components/ui/Button"; // custom button we made earlier
import { Check } from "lucide-react";

const ServiceCard = ({
  title,
  description,
  price,
  duration,
  features,
  popular = false,
  selected = false,
  onToggle,
}) => {
  return (
    <div
      className={`relative h-full flex flex-col rounded-2xl p-6 transition-all duration-300 cursor-pointer border backdrop-blur-md 
      ${
        selected
          ? "border-blue-500 shadow-lg shadow-blue-500/30 bg-blue-950/40"
          : "border-gray-700 bg-gray-900/50 hover:border-blue-400"
      }`}
      onClick={onToggle}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          ⭐ Most Popular
        </span>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold text-blue-400">${price}</span>
          <span className="text-gray-400">• {duration}</span>
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-blue-400 mt-[2px]" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={selected ? "default" : "outline"}
        className={`w-full ${selected ? "bg-blue-500 text-white" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {selected ? "Selected" : "Select Service"}
      </Button>
    </div>
  );
};

export default ServiceCard;
