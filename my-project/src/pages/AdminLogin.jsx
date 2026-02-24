import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/api/auth/login", form);

      login(res.data.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1115] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-2 items-center">
        {/* LEFT SIDE */}
        <div className="text-center lg:text-left space-y-6 py-12">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Precision Toronto
          </h1>

          <p className="text-gray-400 max-w-md mx-auto lg:mx-0">
            Premium car detailing management system. Manage bookings, optimize
            workflow, and deliver excellence.
          </p>

          {/* Features */}
          <div className="hidden lg:block space-y-4 pt-4">
            {[
              "Real-time booking & scheduling",
              "Full operational control",
              "Built for scaling your business",
            ].map((item, i) => (
              <div
                key={i}
                className="text-sm text-gray-300 flex items-center justify-center lg:justify-start gap-2"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE (FORM CARD) */}
        <div className="w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
              {/* Glow effect */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full"></div>

              <h2 className="text-2xl font-semibold mb-1 text-center lg:text-left">
                Welcome Back
              </h2>

              <p className="text-sm text-gray-400 mb-6 text-center lg:text-left">
                Login to access your dashboard
              </p>

              {error && (
                <div className="mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-black/40 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
