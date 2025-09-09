// src/components/ServiceCard.jsx
import React from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { getDisplayDuration } from "../utils/duration"; // ✅ import

const ServiceCard = ({
  id,
  title,
  description,
  duration,
  price,
  features = [],
  image,
  popular = false,
  selected = false,
  onToggle = () => {},
}) => {
  return (
    <article
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle();
      }}
      onClick={onToggle}
      className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-shadow duration-200 cursor-pointer border
        ${
          selected
            ? "border-blue-500 shadow-xl bg-gradient-to-b from-slate-900/60 to-slate-900/40"
            : "border-gray-700 bg-gray-900/50 hover:border-blue-400"
        }`}
    >
      {popular && (
        <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-xs font-semibold shadow">
          ⭐ Most Popular
        </span>
      )}

      {/* Image */}
      <div className="h-44 w-full overflow-hidden bg-gray-800">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transform transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <header className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </header>

        {/* Features */}
        <div className="flex-1">
          <ul className="space-y-2 mb-4">
            {features.slice(0, 5).map((f, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-200"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-[3px]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-blue-400">${price}</span>
            <p className="text-sm text-gray-400">
              {duration ? `⏱ ${getDisplayDuration(duration)}` : "⏱ Est. time"}
            </p>
          </div>

          <Button
            variant={selected ? "default" : "outline"}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {selected ? "Selected" : "Select Service"}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
