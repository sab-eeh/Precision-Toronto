import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Save token to localStorage
      localStorage.setItem("adminToken", data.token);

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <form
        onSubmit={handleLogin}
        className="bg-white/5 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Admin Login
        </h2>
        {error && (
          <div className="bg-red-800/60 text-red-200 p-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded mb-4 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded mb-4 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 transition"
        >
          Login
        </button>
        <div className="mt-4 text-center">
          <Link
            to="/admin/forgot-password"
            className="text-sm text-blue-300 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
