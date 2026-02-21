import React, { useRef } from "react";
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
  selected = false,
  onToggle = () => {},
}) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  // ✅ FIX: Prevent click while scrolling (mobile bug fix)
  const handlePointerDown = (e) => {
    startX.current = e.clientX || e.touches?.[0]?.clientX;
    startY.current = e.clientY || e.touches?.[0]?.clientY;
    isDragging.current = false;
  };

  const handlePointerMove = (e) => {
    const x = e.clientX || e.touches?.[0]?.clientX;
    const y = e.clientY || e.touches?.[0]?.clientY;

    if (Math.abs(x - startX.current) > 8 || Math.abs(y - startY.current) > 8) {
      isDragging.current = true;
    }
  };

  const handleClick = () => {
    if (!isDragging.current) {
      onToggle();
    }
  };

  return (
    <article
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle();
      }}
      className={`group relative flex flex-col h-full rounded-2xl overflow-hidden border transition-all duration-300
        ${
          selected
            ? "border-blue-500 bg-gradient-to-b from-slate-900/80 to-slate-900/50 shadow-2xl"
            : "border-gray-700 bg-[#111417] hover:border-blue-400 hover:shadow-xl"
        }`}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Tag */}
        {tag && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-400 text-black shadow">
              {tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed mb-2 line-clamp-2">
          {addionaldesc}
        </p>

        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-2 mb-4">
          {features.slice(0, 4).map((f, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-gray-300"
            >
              <CheckCircle2 className="w-4 h-4 text-blue-400 mt-[2px]" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-bold text-blue-400">${price}</span>

            <span className="text-xs text-gray-400">
              {duration ? getDisplayDuration(duration) : "Est. time"}
            </span>
          </div>

          <Button
            variant={selected ? "default" : "outline"}
            className="w-full text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
