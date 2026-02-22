// backend/src/utils/normalizePayload.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TZ = "America/Toronto";

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
    startAt: startAtISO ? dayjs.tz(startAtISO, BUSINESS_TZ).toDate() : null,
    slotMinutes: slotMinutes || 60,
    selectedDate,
    selectedTime,
  };
};
