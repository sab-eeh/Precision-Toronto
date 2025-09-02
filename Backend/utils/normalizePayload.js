// utils/normalizePayload.js
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

  // Deduplicate services by title + price
  const uniqueServices = Array.from(
    new Map(
      selectedServices.map((s) => [
        (s.title || "").toLowerCase().trim() + "|" + s.price,
        {
          serviceId: s._id || null,
          title: s.title.trim(),
          price: s.price,
          durationMinutes: s.durationMinutes || 60,
        },
      ])
    ).values()
  );

  // Deduplicate addons by title + price
  const uniqueAddons = Array.from(
    new Map(
      selectedAddons.map((a) => [
        (a.title || "").toLowerCase().trim() + "|" + a.price,
        {
          addonId: a._id || null,
          title: a.title.trim(),
          price: a.price,
        },
      ])
    ).values()
  );

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
    },
    services: uniqueServices,
    addons: uniqueAddons,
    carType: selectedCar,
    totalPrice,
    startAt: startAtISO ? new Date(startAtISO) : null,
    slotMinutes: slotMinutes || 60,
  };
};
