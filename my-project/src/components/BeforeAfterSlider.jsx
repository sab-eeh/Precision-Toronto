import React, { useState } from "react";
import beforeAfterImage from "../assets/before-after.jpg";

const BeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Experience the Difference
          </h2>
          <p className="text-muted-foreground">
            From dull and dirty to spotless and sleek — our detailing service
            transforms your vehicle like never before. Use the slider below to
            see the stunning results.
          </p>
        </div>

        {/* Card with Slider */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl border border-gray-600">
          {/* Slider Header */}
          {/* <div className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              See The Transformation
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Slide the handle to compare the <span className="font-semibold">before</span> 
              and <span className="font-semibold">after</span> of our premium detailing.
            </p>
          </div> */}

          {/* Before/After Images */}
          <div className="relative h-[450px] overflow-hidden group">
            {/* Before Image */}
            <div
              className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-300"
              style={{
                backgroundImage: `url(${beforeAfterImage})`,
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <div className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                BEFORE
              </div>
            </div>

            {/* After Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{
                backgroundImage: `url(${beforeAfterImage})`,
                clipPath: `inset(0 0 0 ${sliderPosition}%)`,
              }}
            >
              <div className="absolute top-4 right-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                AFTER
              </div>
            </div>

            {/* Slider Line + Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-xl transition-all"
              style={{
                left: `${sliderPosition}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl border-2 border-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
              </div>
            </div>

            {/* Range Input (transparent overlay) */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
