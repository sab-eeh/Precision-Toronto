import React from "react";
import { CheckCircle2 } from "lucide-react";
import Button from "../components/ui/Button";
import { getDisplayDuration } from "../utils/duration";

const ServiceCard = ({
  id,
  title,
  tag,
  description,
  addionaldesc,
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
      className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border
        ${
          selected
            ? "border-blue-500 shadow-2xl bg-gradient-to-b from-slate-900/70 to-slate-900/50"
            : "border-gray-700 bg-gray-900/50 hover:border-blue-400 hover:shadow-xl"
        }`}
    >
      {/* Image */}
      <div className="h-44 w-full overflow-hidden bg-gray-800">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Tag + Title */}
        <header className="mb-4 text-center">
          {tag && (
            <div className="mb-3 flex justify-center">
              <span
                className="
                  text-xs font-semibold tracking-wide
                  px-3 py-1 rounded-full
                  bg-gradient-to-r from-yellow-400 to-yellow-500
                  text-black shadow-md
                "
              >
                {tag}
              </span>
            </div>
          )}

          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-200 mt-2 leading-relaxed">
            {addionaldesc}
          </p>
          <p className="text-sm text-gray-400 mt-2 leading-relaxed">
            {description}
          </p>
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
          <div className="flex items-center justify-between mb-4">
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
