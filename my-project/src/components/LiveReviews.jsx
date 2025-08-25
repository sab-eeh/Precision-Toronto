import React, { useEffect } from "react";

const ReviewsSection = () => {
  useEffect(() => {
    // Load Trustindex script dynamically
    const script = document.createElement("script");
    script.src =
      "https://cdn.trustindex.io/loader.js?e01129752e62717b1106d2a7c4b";
    script.async = true;
    script.defer = true;

    const container = document.getElementById("trustindex-widget");
    container.appendChild(script);

    // Apply CSS overrides AFTER script loads
    script.onload = () => {
      const style = document.createElement("style");
      style.innerHTML = `
        /* Force one row */
        .ti-widget-container {
          display: flex !important;
          flex-wrap: nowrap !important;
          overflow: hidden !important;   /* hide scrollbars */
        }
        /* Make each review fixed width so they don't stack */
        .ti-review {
          flex: 0 0 auto !important;
          min-width: 320px !important;   /* adjust for your design */
          margin-right: 16px !important;
        }
        /* Prevent Trustindex duplicates */
        .ti-review.duplicate {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    };
  }, []);

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#0A0F11] via-[#0E1417] to-[#0A0F11]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-4 text-white">
            What Our Customers Say
          </h2>
        </div>

        {/* Trustindex Reviews */}
        <div
          id="trustindex-widget"
          className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg overflow-hidden"
        >
          <div
            className="ti-widget"
            data-id="e01129752e62717b1106d2a7c4b"
          ></div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
