import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

const reviews = [
  {
    name: " Anum Patel",
    rating: 5,
    text: "I couldn’t be happier with the detailing job done on my car! It looks and feels brand new—inside and out. Every little nook was cleaned, the paint is shining, and even the carpets smell fresh. The attention to detail really stood out, and the team was super professional and friendly throughout the whole process. You can tell they take pride in their work. Highly recommend to anyone looking to give their car a serious refresh!",
    date: "3 months ago",
  },
  {
    name: "Zaeem Naeem Mirza",
    rating: 5,
    text: "Got a full paint correction and detail on my M4, car looks absolutely flawless now. Haris is very professional and clearly knows his stuff. Highly recommended.",
    date: "3 months ago",
  },
  {
    name: "Hamdi Hilal",
    rating: 5,
    text: "I had my Lexus ES350 interior detailed by Haris, and I couldn’t be more impressed. He was incredibly respectful and treated my car with great care. The interior looks and smells brand new, he didn’t miss a single spot. You can tell he takes pride in his work and values his customers. I highly recommend Precision if you're looking for top-notch detailing with professional service!",
    date: "4 months ago",
  },
  {
    name: "Des Laferrara",
    rating: 5,
    text: "Your car is always in great hands with Precision. consistently delivers top notch results, and your car will look and feel brand new. Professional, detailed, and always making sure you're completely satisfied. never been disappointed! highly, highly recommend:)",
    date: "11 months ago",
  },
  {
    name: "Shams Haroon",
    rating: 5,
    text: "Got my tints done from this business. 30% in the front and 20% in the back and the results came out amazing. Would definitely come back if I needed to get tints done on a new car.",
    date: "a year ago",
  },
  {
    name: "Angie F",
    rating: 5,
    text: "My car looked brand new after Haris took care of it. Unprecedented attention to detail. Best car detailing ever!",
    date: "a year ago",
  },
  {
    name: "Maaz Shaikh",
    rating: 5,
    text: "Such a clean and professional job at an affordable rate. Definitely talented and efficient with the time, had my car spotless in an hour. He goes above and beyond to really take care of your car as his own.",
    date: "2 years ago",
  },
  {
    name: "K S",
    rating: 5,
    text: "My car was a complete mess inside when I brought it in to Precision Toronto. It now looks fantastic. I was thoroughly impressed how clean it looked and smelled. Haris did a fantastic job and took great care of my personal belongings while cleaning my vehicle. I highly recommend his business if you need a good clean up and interior wash.",
    date: "2 years ago",
  },
  {
    name: "Yusuf Ali",
    rating: 5,
    text: "Absolutely spectacular service. Amazing attention to detail. This gentleman had my car looking like I had just purchased it out the showroom. Definitely will be returning, and definitely recommend this service to anyone who is looking to get their vehicle detailed to perfection with a good price tag. Thank you precision auto care!",
    date: "3 years ago",
  },
];

const ReviewsCarousel = () => {
  const [index, setIndex] = useState(0);
  const [reviewsPerSlide, setReviewsPerSlide] = useState(3);

  // Responsive reviews per slide
  useEffect(() => {
    const updateSlides = () => {
      if (window.innerWidth < 640) setReviewsPerSlide(1); // mobile
      else if (window.innerWidth < 1024) setReviewsPerSlide(2); // tablet
      else setReviewsPerSlide(3); // desktop
    };
    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  const next = () =>
    setIndex((prev) => (prev + reviewsPerSlide) % reviews.length);
  const prev = () =>
    setIndex(
      (prev) => (prev - reviewsPerSlide + reviews.length) % reviews.length
    );

  const visibleReviews = reviews.slice(index, index + reviewsPerSlide).length
    ? reviews.slice(index, index + reviewsPerSlide)
    : [
        ...reviews.slice(index),
        ...reviews.slice(0, (index + reviewsPerSlide) % reviews.length),
      ];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 relative">
      {/* Heading + context */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3">
          What Our Customers Say
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
          We’re proud to have earned the trust of our customers. Here’s what
          they have to say about our services and their experiences.
        </p>
      </div>

      <div className="relative md:overflow-visible overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="flex gap-6"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {visibleReviews.map((review, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-900 text-white rounded-2xl shadow-xl p-6 min-w-[280px] hover:bg-gray-800 transition"
              >
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-gray-800 p-3 rounded-full">
                      <User className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-gray-400">{review.date}</p>
                    </div>
                  </div>

                  <div>
                    <FcGoogle className="text-4xl" />
                  </div>
                </div>

                <div className="flex mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`w-5 h-5 ${
                        j < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows at bottom center */}
      <div className="flex justify-center mt-8 gap-6">
        <button
          onClick={prev}
          className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-lg transition"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={next}
          className="bg-gray-800 hover:bg-gray-700 p-3 rounded-full shadow-lg transition"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ReviewsCarousel;
