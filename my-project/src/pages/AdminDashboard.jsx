import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeaders } from "../api/client";
import {
  LayoutDashboard,
  LogOut,
  Calendar,
  User,
  Car,
  DollarSign,
  Wrench,
  Clock,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  X,
  Check,
} from "lucide-react";

const API = "http://localhost:5000/api"; // keep your existing base

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

function statusClasses(status) {
  switch (status) {
    case "completed":
      return "bg-emerald-700/70 text-emerald-100 ring-1 ring-emerald-400/30";
    case "confirmed":
      return "bg-blue-700/70 text-blue-100 ring-1 ring-blue-400/30";
    case "pending":
      return "bg-yellow-700/70 text-yellow-100 ring-1 ring-yellow-400/30";
    case "cancelled":
      return "bg-red-700/70 text-red-100 ring-1 ring-red-400/30";
    case "no_show":
      return "bg-gray-700/70 text-gray-100 ring-1 ring-gray-400/30";
    default:
      return "bg-gray-700 text-gray-100";
  }
}

function toDatetimeLocalValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

function formatDateTimeRange(startAt, endAt) {
  if (!startAt) return "N/A";
  const s = new Date(startAt);
  const e = endAt ? new Date(endAt) : null;
  const dateStr = s.toLocaleDateString();
  const timeStr = s.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endStr = e
    ? e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;
  return endStr
    ? `${dateStr} • ${timeStr}–${endStr}`
    : `${dateStr} • ${timeStr}`;
}

function minutesBetween(a, b) {
  if (!a || !b) return null;
  const ms = new Date(b) - new Date(a);
  return Math.max(1, Math.round(ms / 60000));
}

function uniqueById(items) {
  const map = new Map();
  for (const it of items || []) {
    if (it && it._id) map.set(it._id, it);
  }
  return Array.from(map.values());
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("startAt");
  const [sortDir, setSortDir] = useState("desc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [toast, setToast] = useState(null); // { type: "success"|"error", message }
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // booking object clone for modal edits

  // Auth gate + fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/bookings`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load bookings");

      // Try common shapes: {bookings}, {data}, or array
      const arr = Array.isArray(data) ? data : data.bookings || data.data || [];
      const deduped = uniqueById(arr);
      // Sort newest first by default
      deduped.sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
      setBookings(deduped);
    } catch (e) {
      console.error("Fetch bookings error:", e);
      setToast({
        type: "error",
        message: e.message || "Unable to load bookings",
      });
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    try {
      setRefreshing(true);
      await fetchBookings();
    } finally {
      setRefreshing(false);
    }
  }

  function openEditModal(b) {
    setEditing({
      ...b,
      // Local form fields
      _localStartAt: toDatetimeLocalValue(b.startAt),
      _localStatus: b.status || "confirmed",
      _note: b.notes || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  function onChangeEditing(field, val) {
    setEditing((prev) => ({ ...prev, [field]: val }));
  }

  async function saveEdits() {
    if (!editing?._id) return;
    try {
      const payload = {
        status: editing._localStatus,
      };
      if (editing._localStartAt) {
        // Convert "YYYY-MM-DDTHH:mm" to ISO with timezone awareness
        const local = new Date(editing._localStartAt);
        const off = local.getTimezoneOffset();
        const startAt = new Date(
          local.getTime() + off * 60 * 1000
        ).toISOString();
        payload.startAt = startAt;
      }
      if (editing._note !== undefined) payload.notes = editing._note;

      const res = await fetch(`${API}/bookings/${editing._id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");

      const updated = data.booking || data.data || data;
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
      setToast({ type: "success", message: "Booking updated" });
      closeModal();
    } catch (e) {
      console.error("Update error:", e);
      setToast({ type: "error", message: e.message || "Update failed" });
    }
  }

  async function deleteBooking(id) {
    const ok = window.confirm("Delete this booking? This cannot be undone.");
    if (!ok) return;
    try {
      const res = await fetch(`${API}/bookings/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      setBookings((prev) => prev.filter((b) => b._id !== id));
      setToast({ type: "success", message: "Booking deleted" });
    } catch (e) {
      console.error("Delete error:", e);
      setToast({ type: "error", message: e.message || "Delete failed" });
    }
  }

  // FILTER + SEARCH + SORT + PAGINATE
  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    let arr = bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!qlc) return true;

      const parts = [
        b.customerName,
        b.phone,
        b.email,
        b.address,
        b?.vehicle?.make,
        b?.vehicle?.model,
        b?.vehicle?.plate,
        ...(Array.isArray(b?.services) ? b.services.map((s) => s?.title) : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return parts.includes(qlc);
    });

    arr.sort((a, b) => {
      let av, bv;
      if (sortKey === "startAt") {
        av = new Date(a.startAt).getTime();
        bv = new Date(b.startAt).getTime();
      } else if (sortKey === "totalPrice") {
        av = Number(a.totalPrice) || 0;
        bv = Number(b.totalPrice) || 0;
      } else if (sortKey === "status") {
        av = a.status || "";
        bv = b.status || "";
      } else {
        av = String(a.customerName || "");
        bv = String(b.customerName || "");
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [bookings, q, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    // Reset to page 1 if filters change
    setPage(1);
  }, [q, statusFilter, sortKey, sortDir, pageSize]);

  // UI
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900/80 border-r border-gray-800 backdrop-blur">
        <div className="h-16 flex items-center px-6 text-lg font-semibold border-b border-gray-800">
          <LayoutDashboard className="mr-2 h-5 w-5" /> Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <span className="w-full flex items-center px-3 py-2 rounded-lg bg-gray-800 text-white">
            <Calendar className="mr-2 h-5 w-5" /> Bookings
          </span>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin-login");
          }}
          className="flex items-center justify-center gap-2 m-4 px-4 py-2 rounded-xl border border-gray-800 hover:bg-gray-800/60 transition"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-800">
          <h1 className="text-base font-semibold flex items-center">
            <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin-login");
            }}
            className="text-red-400"
          >
            <LogOut />
          </button>
        </header>

        {/* Controls */}
        <section className="p-4 md:p-6 border-b border-gray-900 bg-gray-950/70">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
              <p className="text-gray-400 text-sm">
                Manage, edit, and delete bookings. Data is live from the server.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, vehicle, phone, service…"
                  className="pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={`${sortKey}:${sortDir}`}
                    onChange={(e) => {
                      const [k, d] = e.target.value.split(":");
                      setSortKey(k);
                      setSortDir(d);
                    }}
                    className="pl-3 pr-8 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="startAt:desc">Newest first</option>
                    <option value="startAt:asc">Oldest first</option>
                    <option value="totalPrice:desc">Price high → low</option>
                    <option value="totalPrice:asc">Price low → high</option>
                    <option value="customerName:asc">Name A → Z</option>
                    <option value="customerName:desc">Name Z → A</option>
                    <option value="status:asc">Status A → Z</option>
                    <option value="status:desc">Status Z → A</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="pl-3 pr-8 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={refresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800/70 text-sm disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="rounded-2xl border border-gray-900 bg-gray-950/60 shadow-inner overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-900/80 text-gray-300 sticky top-0 z-10">
                  <tr className="text-left">
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Services</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4">
                          <div className="h-3 w-40 bg-gray-800 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-3 w-32 bg-gray-800 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-3 w-48 bg-gray-800 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-3 w-36 bg-gray-800 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-3 w-20 bg-gray-800 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-3 w-16 bg-gray-800 rounded" />
                        </td>
                        <td className="px-4 py-4">
                          <div className="h-6 w-20 bg-gray-800 rounded-full" />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="h-8 w-28 bg-gray-800 rounded-xl ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-gray-400"
                      >
                        No bookings found.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((b) => {
                      const vehicle = b?.vehicle
                        ? [b.vehicle.make, b.vehicle.model, b.vehicle.year]
                            .filter(Boolean)
                            .join(" ")
                        : "—";
                      const services =
                        Array.isArray(b?.services) && b.services.length
                          ? b.services
                              .map((s) => s?.title)
                              .filter(Boolean)
                              .join(", ")
                          : "—";
                      const range = formatDateTimeRange(b.startAt, b.endAt);
                      const mins = minutesBetween(b.startAt, b.endAt);

                      return (
                        <tr key={b._id} className="hover:bg-gray-900/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {b.customerName || "N/A"}
                                </span>
                                <span className="text-gray-400 text-xs">
                                  {b.phone || ""}{" "}
                                  {b.email ? `• ${b.email}` : ""}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-gray-400" />
                              <span>{vehicle || "N/A"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <Wrench className="h-4 w-4 text-gray-400 mt-0.5" />
                              <span className="line-clamp-2">{services}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{range}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{mins ? `${mins} min` : "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">
                                {typeof b.totalPrice === "number"
                                  ? `$${b.totalPrice}`
                                  : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(b)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs"
                                title="View / Edit"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </button>
                              <button
                                onClick={() => openEditModal(b)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                                title="Edit booking"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteBooking(b._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs"
                                title="Delete booking"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer / Pagination */}
            {!loading && filtered.length > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-900 bg-gray-950/70">
                <div className="text-xs text-gray-400">
                  Showing{" "}
                  <span className="text-gray-200">
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, filtered.length)}
                  </span>{" "}
                  of <span className="text-gray-200">{filtered.length}</span>{" "}
                  bookings
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-300">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border ${
              toast.type === "success"
                ? "bg-emerald-900/80 border-emerald-700 text-emerald-100"
                : "bg-red-900/80 border-red-700 text-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative w-[95%] max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-4 md:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Booking</h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-900 text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Client</label>
                <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                  {editing.customerName || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Phone / Email</label>
                <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                  {[editing.phone, editing.email].filter(Boolean).join(" • ") ||
                    "—"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Status</label>
                <select
                  value={editing._localStatus}
                  onChange={(e) =>
                    onChangeEditing("_localStatus", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">
                  Reschedule (local time)
                </label>
                <input
                  type="datetime-local"
                  value={editing._localStartAt}
                  onChange={(e) =>
                    onChangeEditing("_localStartAt", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <p className="text-[11px] text-gray-500">
                  End time is auto-calculated on the server from services’
                  duration.
                </p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-gray-400">Notes</label>
                <textarea
                  rows={3}
                  value={editing._note}
                  onChange={(e) => onChangeEditing("_note", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Add internal notes…"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Vehicle</label>
                  <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                    {editing?.vehicle
                      ? [
                          editing.vehicle.make,
                          editing.vehicle.model,
                          editing.vehicle.year,
                        ]
                          .filter(Boolean)
                          .join(" ") || "—"
                      : "—"}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Services</label>
                  <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                    {Array.isArray(editing?.services) && editing.services.length
                      ? editing.services
                          .map((s) => s?.title)
                          .filter(Boolean)
                          .join(", ")
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">When</label>
                  <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                    {formatDateTimeRange(editing.startAt, editing.endAt)}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Total</label>
                  <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                    {typeof editing.totalPrice === "number"
                      ? `$${editing.totalPrice}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveEdits}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
