// src/api/client.js
const BASE_URL = "http://localhost:5000"; // change if needed

// Generic request function
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Helper for auth headers
export function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function registerAdmin() {
  try {
    const data = await api("/register-admin", {
      method: "POST",
      body: {
        name: "Admin User",
        email: "admin@example.com",
        password: "securePassword123",
      },
    });

    console.log("✅ Admin registered:", data);
  } catch (err) {
    console.error("❌ Registration failed:", err.message);
  }
}

// Default export for convenience
export default api;
