// src/components/ui/Card.jsx
import React from "react";

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white shadow-md rounded-2xl p-6 border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
