// src/pages/Contact.jsx
import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import FloatingContact from "../components/FloatingContact";

import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div>
      <Header />
      <FloatingContact />

      {/* Contact Section */}
      <section className="bg-background py-20 px-6 md:px-14">
        <div className="container mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions or want to book a service? Fill out the form below
              and we’ll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-2xl shadow-card p-8">
              <form className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="(123) 456-7890"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    placeholder="Write your message..."
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-400 focus:outline-none transition resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-400 text-black font-semibold py-3 rounded-lg shadow-md hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Mail className="w-7 h-7 text-blue-400" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p className="text-muted-foreground">
                    info@precisiontoronto.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="w-7 h-7 text-blue-400" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <p className="text-muted-foreground">(416) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MapPin className="w-7 h-7 text-blue-400" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p className="text-muted-foreground">
                    Serving Greater Toronto Area
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
