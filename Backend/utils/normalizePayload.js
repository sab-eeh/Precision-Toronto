const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TZ = "America/Toronto";

/**
 * Safely convert to number
 */
const toNumber = (val, fallback = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

/**
 * Deduplicate array items
 */
const dedupe = (arr = [], keyFn) => {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Map(arr.map((item) => [keyFn(item), item])).values());
};

/**
 * Normalize services / addons
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
 * Build valid startAt date safely
 */
const buildStartAt = ({ startAtISO, selectedDate, selectedTime }) => {
  let parsed;

  // ✅ Case 1: ISO string (preferred)
  if (startAtISO) {
    parsed = dayjs.utc(startAtISO).tz(BUSINESS_TZ);
  }

  // ✅ Case 2: fallback from date + time
  else if (selectedDate && selectedTime) {
    const combined = `${selectedDate} ${selectedTime}`;
    parsed = dayjs.tz(combined, BUSINESS_TZ);
  }

  // ❌ Invalid case
  if (!parsed || !parsed.isValid()) {
    throw new Error("Invalid startAt date");
  }

  return parsed.toDate();
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

  // Normalize service type
  const normalizedServiceType = ["mobile", "dropoff"].includes(
    String(serviceType).toLowerCase()
  )
    ? serviceType.toLowerCase()
    : "mobile";

  // Build startAt safely
  const startAt = buildStartAt({
    startAtISO,
    selectedDate,
    selectedTime,
  });

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

    startAt,

    slotMinutes: toNumber(slotMinutes, 60),

    selectedDate,
    selectedTime,
  };
};

module.exports = { normalizePayload };
