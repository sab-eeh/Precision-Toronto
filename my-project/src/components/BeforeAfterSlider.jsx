import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Example combined images (each contains before on top, after on bottom)
import transformation1 from "../assets/home/transformation1.jpg";
import transformation2 from "../assets/home/transformation2.jpg";
import transformation3 from "../assets/home/transformation3.jpg";
import transformation4 from "../assets/home/transformation4.jpg";

const images = [
  transformation1,
  transformation2,
  transformation3,
  transformation4,
];

const VerticalBeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setSliderPosition(50);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setSliderPosition(50);
  };

  const currentImage = images[currentIndex];

  return (
    <section className="py-16 bg-transparent">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-400 mb-3">
            Experience the Difference
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Slide vertically to reveal the transformation — or use quick buttons
            below to view before/after.
          </p>
        </div>

        {/* Before/After Slider */}
        <div className="relative max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-[400px] sm:h-[480px] md:h-[560px] lg:h-[620px] overflow-hidden group">
            {/* Top (Before) */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "100% 200%", // stretch vertically
                backgroundPosition: "top", // show top part (before)
                clipPath: `inset(0 0 ${100 - sliderPosition}% 0)`,
              }}
            />

            {/* Bottom (After) */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "100% 200%",
                backgroundPosition: "bottom", // show bottom part (after)
                clipPath: `inset(${sliderPosition}% 0 0 0)`,
              }}
            />

            {/* Slider Line + Handle */}
            <div
              className="absolute left-0 right-0 h-0.5 bg-gray-400"
              style={{
                top: `${sliderPosition}%`,
                transform: "translateY(-50%)",
                transition: "top 0.3s ease",
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full shadow-md border border-gray-400 flex items-center justify-center group-hover:scale-110 transition">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
              </div>
            </div>

            {/* Range Input (vertical) */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-row-resize"
              orient="vertical"
            />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full shadow transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full shadow transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Before / After Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setSliderPosition(100)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            See Before
          </button>
          <button
            onClick={() => setSliderPosition(0)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            See After
          </button>
        </div>

        {/* Image Thumbnails for Navigation */}
        {/* <div className="flex justify-center gap-3 mt-6">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setSliderPosition(50);
              }}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 transition ${
                idx === currentIndex
                  ? "border-gray-900"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Transformation ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default VerticalBeforeAfterSlider;
