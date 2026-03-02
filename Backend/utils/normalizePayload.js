const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TZ = "America/Toronto";

/**
 * Safely converts value to number
 */
const toNumber = (val, fallback = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

/**
 * Deduplicate array based on key
 */
const dedupe = (arr = [], keyFn) => {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Map(arr.map((item) => [keyFn(item), item])).values());
};

/**
 * Normalize services/addons
 */
const normalizeItems = (items, type = "service") => {
  const durationFallback = type === "service" ? 60 : 30;

  return dedupe(
    items,
    (i) => `${(i.title || "").toLowerCase().trim()}|${i.price}`
  ).map((i) => ({
    [`${type}Id`]: i._id || null,
    title: i.title?.trim() || "",
    price: toNumber(i.price),
    durationMinutes: toNumber(i.durationMinutes, durationFallback),
  }));
};

/**
 * Normalize booking payload
 */
const normalizePayload = (body = {}) => {
  const payload = body?.body ?? body;

  const {
    serviceType,
    city,
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
  } = payload;

  const normalizedServiceType = ["mobile", "dropoff"].includes(
    String(serviceType).toLowerCase()
  )
    ? serviceType.toLowerCase()
    : "mobile";

  return {
    customerName: customerInfo?.name?.trim() || "",
    email: customerInfo?.email?.trim().toLowerCase() || "",
    phone: String(customerInfo?.phone || "").trim(),

    notes: notes || "",

    serviceType: normalizedServiceType,
    city: city?.trim() || null,

    vehicle: {
      make: vehicleInfo?.make || "",
      model: vehicleInfo?.model || "",
      year: vehicleInfo?.year || "",
      plate: vehicleInfo?.plate || "",
      type: selectedCar || "",
    },

    services: normalizeItems(selectedServices, "service"),
    addons: normalizeItems(selectedAddons, "addon"),

    totalPrice: toNumber(totalPrice),

    startAt: startAtISO
      ? dayjs.tz(startAtISO, BUSINESS_TZ).toDate()
      : undefined,

    slotMinutes: toNumber(slotMinutes, 60),

    selectedDate,
    selectedTime,
  };
};

module.exports = { normalizePayload };
