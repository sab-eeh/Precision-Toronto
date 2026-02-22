const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
// Generic request function
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
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
  } catch (error) {
    console.error("❌ API Error:", error.message);

    // Helpful debug message
    if (error.message.includes("Failed to fetch")) {
      console.error("🚨 Backend unreachable. Check API URL or server.");
    }

    throw error;
  }
}

// Helper for auth headers
export function authHeaders() {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Optional: Remove this in production (only for dev testing)
async function registerAdmin() {
  try {
    const data = await api("/api/auth/register-admin", {
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

export default api;
