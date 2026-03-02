const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TZ = "America/Toronto";

const normalizePayload = (body) => {
  const payload = body.body || body;

  const { serviceType, city } = payload;

  const normalizedServiceType = String(serviceType || "").toLowerCase();

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
    startAt,
    slotMinutes,
  } = payload;

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
    customerName: customerInfo?.name?.trim() || "",
    email: customerInfo?.email?.trim().toLowerCase() || "",
    phone: String(customerInfo?.phone || "").trim(),

    notes: notes || "",

    serviceType:
      normalizedServiceType === "mobile" || normalizedServiceType === "dropoff"
        ? normalizedServiceType
        : "mobile",

    city: city ? city.trim() : null,

    vehicle: {
      make: vehicleInfo?.make,
      model: vehicleInfo?.model,
      year: vehicleInfo?.year,
      plate: vehicleInfo?.plate,
      type: selectedCar,
    },

    services,
    addons,

    totalPrice: Number(totalPrice) || 0,

    startAt: startAt
      ? dayjs.tz(startAt, BUSINESS_TZ).toDate()
      : undefined,

    slotMinutes: slotMinutes || 60,

    selectedDate,
    selectedTime,
  };
};

module.exports = {normalizePayload};
