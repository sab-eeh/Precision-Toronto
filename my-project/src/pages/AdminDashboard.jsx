// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Fetch admin + bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const resAdmin = await fetch("http://localhost:5000/api/auth/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataAdmin = await resAdmin.json();
        if (!resAdmin.ok) {
          setError("Unauthorized");
          navigate("/admin/login");
          return;
        }
        setAdmin(dataAdmin.admin);

        const resBookings = await fetch("http://localhost:5000/api/bookings?page=1&limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataBookings = await resBookings.json();
        const items = Array.isArray(dataBookings)
          ? dataBookings
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
      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: "approved" } : b))
        );
      } else {
        console.error("Approval failed", await res.json());
      }
    } catch (err) {
      console.error("Approval failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        console.error("Delete failed", await res.json());
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {error && <p className="text-red-400">{error}</p>}

        {admin ? (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Welcome, <span className="text-blue-400">{admin.role}</span> 🚀
            </h2>

            <h3 className="text-lg font-bold mb-4 text-gray-200">
              📌 All Bookings
            </h3>

            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="w-full border-collapse bg-gray-800 text-gray-200">
                <thead>
                  <tr className="bg-gray-700 text-left text-gray-300">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b._id}
                      className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="p-3">{b.customerName || b.name}</td>
                      <td className="p-3">{b.email || "N/A"}</td>
                      <td className="p-3">
                        {b.startAt
                          ? new Date(b.startAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            b.status === "approved"
                              ? "bg-green-600"
                              : "bg-yellow-600"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        {b.status !== "approved" && (
                          <button
                            onClick={() => handleApprove(b._id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>Loading dashboard...</p>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
