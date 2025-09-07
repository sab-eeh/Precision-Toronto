// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authHeaders } from "../api/client";
import {
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
  Download,
  FilePlus,
} from "lucide-react";

/**
 * AdminDashboard (responsive, enhanced)
 *
 * - Keeps your dark theme and original logic.
 * - Improves responsiveness so elements won't overlap on small screens.
 * - Adds: summary cards, bulk select & delete, export CSV, clearer wrapping/truncation.
 * - Uses plain React + Tailwind classes.
 *
 * Replace original AdminDashboard.jsx with this file.
 */

const API = "http://localhost:5000/api";
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

function computeServiceSchedule(startAtISO, services = []) {
  if (!startAtISO || !Array.isArray(services)) return [];
  const start = new Date(startAtISO);
  const out = [];
  let cursor = new Date(start);
  for (const s of services) {
    const durationMin =
      Number(s.duration || s.minutes || s.durationMinutes || 0) || 0;
    const serviceStart = new Date(cursor);
    const serviceEnd = new Date(cursor.getTime() + durationMin * 60_000);
    out.push({
      ...s,
      _schedStart: serviceStart.toISOString(),
      _schedEnd: serviceEnd.toISOString(),
      _durationMin: durationMin,
    });
    cursor = serviceEnd;
  }
  return out;
}

function isNewBooking(createdAt, minutes = 10) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const diff = (Date.now() - created.getTime()) / 60000;
  return diff <= minutes;
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

  const [toast, setToast] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [modalEditing, setModalEditing] = useState(null);

  // New enhanced state:
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);

  // auth gate + initial fetch
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
      const arr = Array.isArray(data) ? data : data.bookings || data.data || [];
      const deduped = uniqueById(arr);
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
      setToast({ type: "success", message: "Refreshed" });
    } catch (e) {
      setToast({ type: "error", message: "Refresh failed" });
    } finally {
      setRefreshing(false);
    }
  }

  async function approveBooking(b) {
    if (!b?._id) return;
    try {
      setToast({ type: "success", message: "Approving booking..." });
      const res = await fetch(`${API}/bookings/${b._id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Approve failed");
      const updated = data.booking || data.data || data;
      setBookings((prev) =>
        prev.map((x) => (x._id === updated._id ? updated : x))
      );
      setToast({ type: "success", message: "Booking approved" });
      setExpandedBookingId(updated._id);
    } catch (e) {
      console.error("Approve error:", e);
      setToast({ type: "error", message: e.message || "Approve failed" });
    }
  }

  async function toggleServiceDone(booking, serviceIndex) {
    try {
      const services = Array.isArray(booking.services)
        ? [...booking.services]
        : [];
      if (!services[serviceIndex]) return;
      const current = !!services[serviceIndex].done;
      services[serviceIndex] = { ...services[serviceIndex], done: !current };

      setBookings((prev) =>
        prev.map((b) => (b._id === booking._id ? { ...b, services } : b))
      );

      const res = await fetch(`${API}/bookings/${booking._id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ services }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update services failed");
      const updated = data.booking || data.data || data;
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
      setToast({ type: "success", message: "Service updated" });
    } catch (e) {
      console.error("Service toggle error:", e);
      setToast({
        type: "error",
        message: e.message || "Service update failed",
      });
      fetchBookings();
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
      setSelectedIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    } catch (e) {
      console.error("Delete error:", e);
      setToast({ type: "error", message: e.message || "Delete failed" });
    }
  }

  // Bulk delete
  async function bulkDeleteSelected() {
    if (selectedIds.size === 0) {
      setToast({ type: "error", message: "No bookings selected" });
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedIds.size} selected booking(s)? This cannot be undone.`
      )
    )
      return;
    try {
      // try to delete in parallel (adjust backend if you have batch delete)
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) =>
          fetch(`${API}/bookings/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
          })
        )
      );
      setBookings((prev) => prev.filter((b) => !selectedIds.has(b._id)));
      setSelectedIds(new Set());
      setSelectAllOnPage(false);
      setToast({ type: "success", message: "Selected bookings deleted" });
    } catch (e) {
      console.error("Bulk delete error:", e);
      setToast({ type: "error", message: "Bulk delete failed" });
    }
  }

  // Export visible (filtered) bookings to CSV
  function exportCSV(items) {
    if (!items || items.length === 0) {
      setToast({ type: "error", message: "No data to export" });
      return;
    }
    const headers = [
      "ID",
      "Client",
      "Phone",
      "Email",
      "Vehicle",
      "Services",
      "StartAt",
      "EndAt",
      "Status",
      "TotalPrice",
    ];
    const rows = items.map((b) => {
      const vehicle = b?.vehicle
        ? [b.vehicle.make, b.vehicle.model, b.vehicle.year]
            .filter(Boolean)
            .join(" ")
        : "";
      const servicesTitles =
        Array.isArray(b?.services) && b.services.length
          ? b.services
              .map((s) => s?.title)
              .filter(Boolean)
              .join("; ")
          : "";
      return [
        b._id,
        b.customerName || "",
        b.phone || "",
        b.email || "",
        vehicle,
        servicesTitles,
        b.startAt || "",
        b.endAt || "",
        b.status || "",
        typeof b.totalPrice === "number" ? b.totalPrice : "",
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings_export_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setToast({ type: "success", message: "Export started" });
  }

  // Filters + sort + paginate
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
    setPage(1);
  }, [q, statusFilter, sortKey, sortDir, pageSize]);

  // Update page selection when pageItems change
  useEffect(() => {
    if (selectAllOnPage) {
      const next = new Set(selectedIds);
      pageItems.forEach((b) => next.add(b._id));
      setSelectedIds(next);
    } else {
      // ensure if selectAllOnPage is false, we do not remove existing cross-page selections
      // but we don't auto-clear anything here.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageItems]);

  // Toggle one selection
  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Toggle select all on current page
  function toggleSelectAllOnPage() {
    if (selectAllOnPage) {
      // unselect page items
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageItems.forEach((b) => next.delete(b._id));
        return next;
      });
      setSelectAllOnPage(false);
    } else {
      // select page items
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageItems.forEach((b) => next.add(b._id));
        return next;
      });
      setSelectAllOnPage(true);
    }
  }

  // Summary calculations
  const summary = useMemo(() => {
    const total = bookings.reduce((s, b) => s + (Number(b.totalPrice) || 0), 0);
    const counts = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    return { totalRevenue: total, counts, totalBookings: bookings.length };
  }, [bookings]);

  // Prevent overlap & long text - utility class usage in markup

  return (
    <div
      className="min-h-screen bg-gradient-to-bl from-gray-950 via-gray-900 to-gray-800 text-gray-100"
      style={{ overflowX: "hidden" }}
    >
      {/* TOP HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 md:px-8 py-3 border-b border-gray-800 gap-3">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 hidden md:block">
            Welcome back, Haris
          </div>
          <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-700/60 to-violet-700/40 border border-gray-800 text-sm font-semibold whitespace-nowrap">
            Haris Dashboard
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:block text-sm text-gray-400 mr-2">
            Logged as Admin
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin-login");
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/60 hover:bg-gray-900/80 border border-gray-800 transition"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300 hidden sm:inline">
              Logout
            </span>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-4 md:p-6">
        {/* Title + summary cards */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bookings</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-xl">
              Live bookings — approve, schedule and track service progress. Use
              the controls to filter, sort, export or perform bulk actions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto mt-2 lg:mt-0">
            <div className="px-3 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-300 flex items-center gap-3 min-w-[160px]">
              <div className="text-sm font-semibold">
                {summary.totalBookings}
              </div>
              <div className="text-[11px] text-gray-400">Total bookings</div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-300 flex items-center gap-3 min-w-[160px]">
              <div className="text-sm font-semibold">
                ${summary.totalRevenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-gray-400">Revenue</div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-300 flex items-center gap-3 min-w-[160px]">
              <div className="text-sm font-semibold">
                {summary.counts.pending || 0}
              </div>
              <div className="text-[11px] text-gray-400">Pending</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <section className="mb-5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, vehicle, phone, service…"
                  className="pl-9 pr-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="relative w-full">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm w-full appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full">
                <select
                  value={`${sortKey}:${sortDir}`}
                  onChange={(e) => {
                    const [k, d] = e.target.value.split(":");
                    setSortKey(k);
                    setSortDir(d);
                  }}
                  className="pl-3 pr-8 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm w-full appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="startAt:desc">Newest first</option>
                  <option value="startAt:asc">Oldest first</option>
                  <option value="totalPrice:desc">Price high → low</option>
                  <option value="totalPrice:asc">Price low → high</option>
                  <option value="customerName:asc">Name A → Z</option>
                  <option value="customerName:desc">Name Z → A</option>
                  <option value="status:asc">Status A → Z</option>
                </select>
              </div>

              <div className="flex gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="pl-3 pr-8 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm w-1/2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>

                <button
                  onClick={refresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800/70 text-sm disabled:opacity-60 w-1/2 justify-center"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* Right side bulk/export */}
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400 hidden sm:inline">
                  Selected:
                </label>
                <div className="text-sm font-medium">{selectedIds.size}</div>
              </div>

              <button
                onClick={() => exportCSV(filtered)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800/60 text-sm"
                title="Export all filtered"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              <button
                onClick={() => exportCSV(pageItems)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800/60 text-sm"
                title="Export page"
              >
                <FilePlus className="h-4 w-4" />
                Export page
              </button>

              <button
                onClick={bulkDeleteSelected}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm"
                title="Delete selected"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Bookings list header (desktop table header) */}
        <section className="space-y-4">
          <div className="hidden lg:grid grid-cols-12 gap-4 items-center px-3 py-2 text-xs text-gray-400 border-b border-gray-800">
            <div className="col-span-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  pageItems.every((b) => selectedIds.has(b._id)) &&
                  pageItems.length > 0
                }
                onChange={toggleSelectAllOnPage}
                className="w-4 h-4 rounded bg-gray-800 border border-gray-700"
                aria-label="Select all on page"
              />
            </div>
            <div className="col-span-3 flex items-center gap-2">Client</div>
            <div className="col-span-2">Vehicle</div>
            <div className="col-span-2">Services</div>
            <div className="col-span-2">When</div>
            <div className="col-span-1">Duration</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Body */}
          {loading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-gray-900/40 border border-gray-800 p-4"
              />
            ))
          ) : pageItems.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 p-6 text-center text-gray-400">
              No bookings found.
            </div>
          ) : (
            pageItems.map((b) => {
              const vehicle = b?.vehicle
                ? [b.vehicle.make, b.vehicle.model, b.vehicle.year]
                    .filter(Boolean)
                    .join(" ")
                : "—";
              const servicesTitles =
                Array.isArray(b?.services) && b.services.length
                  ? b.services
                      .map((s) => s?.title)
                      .filter(Boolean)
                      .join(", ")
                  : "—";
              const range = formatDateTimeRange(b.startAt, b.endAt);
              const mins = minutesBetween(b.startAt, b.endAt);
              const isNew = isNewBooking(b.createdAt || b.createdAtAt, 15);
              const expanded = expandedBookingId === b._id;
              const sched = computeServiceSchedule(b.startAt, b.services || []);
              const checked = selectedIds.has(b._id);

              return (
                <article
                  key={b._id}
                  className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/40 to-gray-900/10 p-4 space-y-3"
                >
                  {/* Selection checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(b._id)}
                      className="w-4 h-4 rounded bg-gray-800 border border-gray-700"
                      aria-label={`Select booking ${b._id}`}
                    />
                  </div>

                  {/* Client info */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-700 to-violet-600 flex items-center justify-center text-white font-semibold">
                      {b.customerName
                        ? b.customerName.slice(0, 1).toUpperCase()
                        : "U"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate">
                          {b.customerName || "N/A"}
                        </h3>
                        {isNew && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-600 text-yellow-900 font-semibold">
                            New
                          </span>
                        )}
                        {b.priority && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-600 text-white">
                            Priority
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 truncate">
                        {b.phone || ""} {b.email ? `• ${b.email}` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle, services, time, duration, total */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{vehicle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{servicesTitles}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{range}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{mins ? `${mins} min` : "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate">
                        {typeof b.totalPrice === "number"
                          ? `$${b.totalPrice}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {b.status === "pending" ? (
                      <button
                        onClick={() => approveBooking(b)}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-900 font-semibold text-xs shadow"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs bg-gray-800/60 border border-gray-700 text-center">
                        {b.status}
                      </span>
                    )}

                    <button
                      onClick={() =>
                        setExpandedBookingId(expanded ? null : b._id)
                      }
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-gray-900/60 border border-gray-800 hover:bg-gray-800/70 text-sm"
                    >
                      {expanded ? "Close" : "Details"}
                    </button>

                    <button
                      onClick={() => deleteBooking(b._id)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>

                  {/* Expanded panel */}
                  {expanded && (
                    <div className="mt-3 rounded-xl bg-gray-900/40 border border-gray-800 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-sm text-gray-300 font-semibold">
                            Client
                          </h4>
                          <div className="text-sm text-gray-200">
                            {b.customerName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.phone || "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.email || "—"}
                          </div>

                          <div className="mt-3">
                            <h4 className="text-sm text-gray-300 font-semibold">
                              Vehicle
                            </h4>
                            <div className="text-sm text-gray-200">
                              {vehicle}
                            </div>
                            <div className="text-xs text-gray-400">
                              {b.vehicle?.plate || ""}
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm text-gray-300 font-semibold">
                              Services
                            </h4>
                            <div className="text-xs text-gray-400">
                              Status / schedule
                            </div>
                          </div>

                          <div className="space-y-3">
                            {sched.length === 0 ? (
                              <div className="text-sm text-gray-400">
                                No services listed.
                              </div>
                            ) : (
                              sched.map((s, idx) => {
                                const now = Date.now();
                                const start = new Date(s._schedStart).getTime();
                                const end = new Date(s._schedEnd).getTime();
                                const isDone = !!s.done;
                                const stateLabel = isDone
                                  ? "Done"
                                  : now < start
                                  ? "Upcoming"
                                  : now >= start && now < end
                                  ? "In progress"
                                  : now >= end
                                  ? "Pending review"
                                  : "Upcoming";
                                return (
                                  <div
                                    key={idx}
                                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg bg-gray-900/30 border border-gray-800"
                                  >
                                    <div className="flex items-center gap-2 md:w-1/4">
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          isDone
                                            ? "bg-emerald-400"
                                            : now < start
                                            ? "bg-yellow-400"
                                            : now >= start && now < end
                                            ? "bg-blue-400"
                                            : "bg-gray-500"
                                        }`}
                                      ></div>
                                      <div className="text-sm text-gray-100 font-medium">
                                        {s.title || s.name || "Service"}
                                      </div>
                                    </div>

                                    <div className="flex-1">
                                      <div className="text-xs text-gray-400">
                                        {s.description || s.note || ""}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {new Date(
                                          s._schedStart
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                          s._schedEnd
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                        {s._durationMin
                                          ? ` • ${s._durationMin} min`
                                          : ""}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2 md:mt-0 md:ml-auto">
                                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-800/50">
                                        {stateLabel}
                                      </span>
                                      <button
                                        onClick={() =>
                                          toggleServiceDone(b, idx)
                                        }
                                        className={`text-xs px-2 py-1 rounded-xl ${
                                          isDone
                                            ? "bg-emerald-600 hover:bg-emerald-500"
                                            : "bg-gray-800/60 hover:bg-gray-800/80"
                                        } text-white`}
                                      >
                                        {isDone ? "Mark undone" : "Mark done"}
                                      </button>
                                      <div className="text-xs text-gray-400">
                                        {s.price ? `$${s.price}` : ""}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Notes + buttons */}
                          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mt-4">
                            <div className="flex-1">
                              <h4 className="text-sm text-gray-300 font-semibold">
                                Notes
                              </h4>
                              <div className="mt-1 text-sm text-gray-300">
                                {b.notes || b.internalNotes || "—"}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  setModalEditing({
                                    ...b,
                                    _localStartAt: toDatetimeLocalValue(
                                      b.startAt
                                    ),
                                    _localStatus: b.status || "confirmed",
                                    _note: b.notes || b.internalNotes || "",
                                  });
                                }}
                                className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                              >
                                Edit booking
                              </button>
                              <button
                                onClick={() => {
                                  if (b.status !== "confirmed")
                                    approveBooking(b);
                                }}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-sm ${
                                  b.status === "confirmed"
                                    ? "bg-gray-800/60 text-gray-300"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                                }`}
                              >
                                {b.status === "confirmed"
                                  ? "Confirmed"
                                  : "Quick Approve"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}

          {/* Pagination footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-3 py-2 border-t border-gray-800 mt-2">
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
        </section>
      </main>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-lg border ${
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
            <div className="text-sm">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="ml-2 opacity-80 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {modalEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setModalEditing(null)}
          />
          <div className="relative w-[95%] max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-4 md:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Booking</h3>
              <button
                onClick={() => setModalEditing(null)}
                className="p-2 rounded-lg hover:bg-gray-900 text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Client</label>
                <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                  {modalEditing.customerName || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Phone / Email</label>
                <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800">
                  {[modalEditing.phone, modalEditing.email]
                    .filter(Boolean)
                    .join(" • ") || "—"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Status</label>
                <select
                  value={modalEditing._localStatus}
                  onChange={(e) =>
                    setModalEditing((prev) => ({
                      ...prev,
                      _localStatus: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800"
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
                  Reschedule (local)
                </label>
                <input
                  type="datetime-local"
                  value={modalEditing._localStartAt}
                  onChange={(e) =>
                    setModalEditing((prev) => ({
                      ...prev,
                      _localStartAt: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800"
                />
                <p className="text-[11px] text-gray-500">
                  End time calculated from services' durations.
                </p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-gray-400">Notes</label>
                <textarea
                  rows={3}
                  value={modalEditing._note}
                  onChange={(e) =>
                    setModalEditing((prev) => ({
                      ...prev,
                      _note: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800"
                  placeholder="Add internal notes…"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalEditing(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!modalEditing._id) return;
                  try {
                    const payload = { status: modalEditing._localStatus };
                    if (modalEditing._localStartAt) {
                      const local = new Date(modalEditing._localStartAt);
                      const off = local.getTimezoneOffset();
                      payload.startAt = new Date(
                        local.getTime() + off * 60 * 1000
                      ).toISOString();
                    }
                    if (modalEditing._note !== undefined)
                      payload.notes = modalEditing._note;
                    const res = await fetch(
                      `${API}/bookings/${modalEditing._id}`,
                      {
                        method: "PUT",
                        headers: {
                          ...authHeaders(),
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                      }
                    );
                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(data?.message || "Update failed");
                    const updated = data.booking || data.data || data;
                    setBookings((prev) =>
                      prev.map((b) => (b._id === updated._id ? updated : b))
                    );
                    setToast({ type: "success", message: "Booking updated" });
                    setModalEditing(null);
                  } catch (err) {
                    console.error(err);
                    setToast({
                      type: "error",
                      message: err.message || "Update failed",
                    });
                  }
                }}
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
