// backend/src/utils/normalizePayload.js
/**
 * Clean and deduplicate booking payload before sending to backend.
 * Designed for frontend use too (JSX import safe).
 */
export const normalizePayload = (body) => {
  const {
    selectedDate,
    selectedTime,
    customerInfo = {},
    vehicleInfo = {},
    selectedServices = [],
    selectedAddons = [],
    selectedCar,
    totalPrice,
    notes,
    startAtISO,
    slotMinutes,
  } = body;

  const dedupe = (arr, keyFn) =>
    Array.from(new Map(arr.map((item) => [keyFn(item), item])).values());

  const services = dedupe(
    selectedServices,
    (s) => `${(s.title || "").toLowerCase().trim()}|${s.price}`
  ).map((s) => ({
    serviceId: s._id || null,
    title: s.title?.trim(),
    price: Number(s.price) || 0,
    durationMinutes: Number(s.durationMinutes) || 60,
  }));

  const addons = dedupe(
    selectedAddons,
    (a) => `${(a.title || "").toLowerCase().trim()}|${a.price}`
  ).map((a) => ({
    addonId: a._id || null,
    title: a.title?.trim(),
    price: Number(a.price) || 0,
    durationMinutes: Number(a.durationMinutes) || 30,
  }));

  return {
    customerName: customerInfo.name,
    email: customerInfo.email,
    phone: customerInfo.phone,
    notes: notes || "",
    vehicle: {
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      year: vehicleInfo.year,
      plate: vehicleInfo.plate,
      type: selectedCar,
    },
    services,
    addons,
    totalPrice: Number(totalPrice) || 0,
    startAt: startAtISO ? new Date(startAtISO) : null,
    slotMinutes: slotMinutes || 60,
    selectedDate,
    selectedTime,
  };
};
