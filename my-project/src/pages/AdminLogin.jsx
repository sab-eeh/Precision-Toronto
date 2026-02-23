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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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
    <div className="min-h-screen flex bg-gradient-to-br from-black via-[#0a0f14] to-[#0f1720] text-white">
      {/* LEFT SIDE (BRANDING) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 border-r border-gray-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-400">
            Precision Toronto
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-sm">
            Premium car detailing management system. Manage bookings, optimize
            workflow, and deliver excellence.
          </p>
        </div>

        <div className="space-y-6 text-sm text-gray-400">
          <div>
            <p className="text-white font-medium">Smart Booking System</p>
            <p>Real-time scheduling with conflict prevention.</p>
          </div>

          <div>
            <p className="text-white font-medium">Operational Control</p>
            <p>Manage services, clients, and performance efficiently.</p>
          </div>

          <div>
            <p className="text-white font-medium">Built for Growth</p>
            <p>Scale your detailing business with confidence.</p>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Precision Toronto
        </p>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-1">Welcome Back</h2>
            <p className="text-sm text-gray-400 mb-6">
              Login to access your dashboard
            </p>

            {error && (
              <div className="mb-4 text-sm bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs text-gray-400">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs text-gray-400">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-medium transition disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Forgot */}
              <div className="text-center text-sm">
                <a
                  href="/admin/forgot-password"
                  className="text-blue-400 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
