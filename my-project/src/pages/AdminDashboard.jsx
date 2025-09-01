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

        // Validate Admin
        const resAdmin = await fetch(
          "http://localhost:5000/api/auth/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const dataAdmin = await resAdmin.json();
        if (!resAdmin.ok) {
          setError("Unauthorized");
          navigate("/admin/login");
          return;
        }
        setAdmin(dataAdmin.admin);

        // Fetch Bookings
        const resBookings = await fetch("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataBookings = await resBookings.json();
        setBookings(dataBookings);
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
      }
    } catch (err) {
      console.error("Approval failed");
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
      }
    } catch (err) {
      console.error("Delete failed");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {error && <p className="text-red-600">{error}</p>}
        {admin ? (
          <div>
            <h2 className="text-lg font-semibold mb-6">
              Welcome, {admin.role} 🚀
            </h2>

            <h3 className="text-xl font-bold mb-4">📌 All Bookings</h3>
            <table className="w-full border-collapse bg-white shadow">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="p-3">{b.name}</td>
                    <td className="p-3">{b.email}</td>
                    <td className="p-3">
                      {new Date(b.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white ${
                          b.status === "approved"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      {b.status !== "approved" && (
                        <button
                          onClick={() => handleApprove(b._id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading dashboard...</p>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
