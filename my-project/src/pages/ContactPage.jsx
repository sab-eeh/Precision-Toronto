import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="bg-[#0B1315]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center text-center bg-[url('/contact-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60"></div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto px-4">
            We’d love to hear from you! Whether you have questions, feedback, or
            want to book a service, our team is here to help.
          </p>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 lg:px-16">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-[#111A1D] rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg bg-[#0B1315] border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-[#0B1315] border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-3 rounded-lg bg-[#0B1315] border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full px-4 py-3 rounded-lg bg-[#0B1315] border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none transition resize-none"
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-md transition-all"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              Contact Information
            </h2>

            <div className="flex items-center gap-4 bg-[#111A1D] p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <Mail className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-medium text-white">Email</p>
                <p className="text-gray-400">info@precisiontoronto.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#111A1D] p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <Phone className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-medium text-white">Phone</p>
                <p className="text-gray-400">(416) 123-4567</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#111A1D] p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <MapPin className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-medium text-white">Location</p>
                <p className="text-gray-400">Serving Greater Toronto Area</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="relative w-full h-[400px] md:h-[500px]">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2887.3983558083244!2d-79.38393498450276!3d43.653226779121!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34d6f0a3a7f7%3A0x2f0d8c1af7a1a0d4!2sToronto%2C%20ON%2C%20Canada!5e0!3m2!1sen!2sca!4v1682254688866!5m2!1sen!2sca"
          width="100%"
          height="100%"
          allowFullScreen=""
          loading="lazy"
          className="rounded-none border-none"
        ></iframe>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
