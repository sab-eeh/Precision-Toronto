import React, { useState, lazy, Suspense } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Meta, Title } from "react-head";

const Map = lazy(() => import("../components/GoogleMap"));
const FloatingContact = lazy(() => import("../components/FloatingContact"));

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // prevent double submit

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed request");
      }

      const data = await res.json();

      if (data.success) {
        setStatus("✅ Message sent successfully!");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("❌ Failed to send. Try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title>Contact Precision Toronto</Title>
      <Meta
        name="description"
        content="Book your car detailing service with Precision Toronto."
      />

      <div className="bg-[#0B1315]">
        <Suspense fallback={null}>
          <FloatingContact />
        </Suspense>

        {/* Hero */}
        <section className="relative min-h-[35vh] md:min-h-[40vh] flex items-center justify-center text-center bg-[url('/contact-bg.jpg')] bg-cover bg-center px-4">
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-2xl"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              Have questions or want to book a service? We’re here to help.
            </p>
          </motion.div>
        </section>

        {/* Main Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#111A1D] rounded-2xl p-6 md:p-8 shadow-lg"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {["name", "email", "phone"].map((field) => (
                  <input
                    key={field}
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={field.toUpperCase()}
                    required={field !== "phone"}
                    className="w-full px-4 py-3 rounded-lg bg-[#0B1315] border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                ))}

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Your message..."
                  required
                  className="w-full px-4 py-3 rounded-lg bg-[#0B1315] border border-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                />

                {status && (
                  <p
                    className={`text-sm ${
                      status.includes("✅") ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {status}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  icon: <Mail className="text-blue-400" />,
                  title: "Email",
                  value: "precisiontoronto@gmail.com",
                },
                {
                  icon: <Phone className="text-blue-400" />,
                  title: "Phone",
                  value: "+1 647-685-7153",
                },
                {
                  icon: <MapPin className="text-blue-400" />,
                  title: "Location",
                  value: "Greater Toronto Area",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-[#111A1D] p-5 rounded-xl"
                >
                  {item.icon}
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Map */}
        <Suspense fallback={<div className="h-64" />}>
          <Map />
        </Suspense>
      </div>
    </>
  );
};

export default Contact;
