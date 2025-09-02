import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api/client";

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          navigate("/admin/login");
          return;
        }
        const resAdmin = await fetch(`${API}/auth/dashboard`, {
          headers: { ...authHeaders() },
        });
        const dataAdmin = await resAdmin.json();
        if (!resAdmin.ok) {
          setError("Unauthorized");
          navigate("/admin/login");
          return;
        }
        setAdmin(dataAdmin.admin);

        const resBookings = await fetch(`${API}/bookings?page=1&limit=100`, {
          headers: { ...authHeaders() },
        });
        const dataBookings = await resBookings.json();
        const items = Array.isArray(dataBookings.items)
          ? dataBookings.items
          : dataBookings.items || [];
        setBookings(items);
      } catch (err) {
        setError("Failed to load dashboard");
      }
    };
    fetchData();
  }, [navigate, token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API}/bookings/${id}/approve`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      if (res.ok)
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: "approved" } : b))
        );
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      if (res.ok) setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">{admin?.email}</div>
          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {error && <p className="text-red-400">{error}</p>}

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-gray-400">No bookings yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-gray-800 rounded-xl shadow p-5 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      {b.customerName || "Customer"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-1">{b.email}</p>
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Date:</span>{" "}
                      {b.startAt ? new Date(b.startAt).toLocaleString() : "N/A"}
                    </p>
                    <p className="text-sm mb-2">
                      <span className="font-semibold">Vehicle:</span>{" "}
                      {b.vehicle?.make} {b.vehicle?.model} ({b.vehicle?.year})
                    </p>

                    <div className="mt-2">
                      <p className="font-semibold text-sm">Services:</p>
                      <ul className="ml-4 list-disc text-gray-300 text-sm">
                        {b.services?.map((s, i) => (
                          <li key={i}>
                            {s.title} – ${s.price}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {b.addons?.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold text-sm">Addons:</p>
                        <ul className="ml-4 list-disc text-gray-300 text-sm">
                          {b.addons.map((a, i) => (
                            <li key={i}>
                              {a.title} – ${a.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="mt-3 font-bold text-green-400">
                      Total: ${b.totalPrice}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Status:{" "}
                      <span
                        className={
                          b.status === "approved"
                            ? "text-green-300"
                            : "text-yellow-300"
                        }
                      >
                        {b.status || "pending"}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    {b.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(b._id)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
