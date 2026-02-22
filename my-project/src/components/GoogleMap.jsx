import React from "react";

const GoogleMap = () => {
  return (
    <div className="w-full flex justify-center">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2875.233619163956!2d-79.02441428851306!3d43.892427970971205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6f0daccc0de9dec5%3A0x53b8b72f377aba9c!2sPrecision%20Toronto!5e0!3m2!1sen!2s!4v1757418020106!5m2!1sen!2s"
        width="100%"
        height="500"
        style={{ border: 0, borderRadius: "16px" }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default GoogleMap;
