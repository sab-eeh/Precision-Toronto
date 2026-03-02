const RAW_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

export async function api(path, { method = "GET", body, headers = {} } = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let data = {};

    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: "Invalid JSON response from server" };
    }

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
    throw error;
  }
}

export function authHeaders() {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export default api;
