// Business hours & slot generation utilities

function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

// Simple overlap check for [aStart, aEnd) vs [bStart, bEnd)
function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Generate slots for a given day.
 * Business hours: 9:00 → 17:00
 * Slot size: 60 minutes (changeable)
 */
function generateSlotsForDay(
  dayStart,
  { startHour = 9, endHour = 17, slotMinutes = 60 } = {}
) {
  const start = new Date(dayStart);
  start.setHours(startHour, 0, 0, 0);

  const end = new Date(dayStart);
  end.setHours(endHour, 0, 0, 0);

  const slots = [];
  let cursor = new Date(start);

  while (addMinutes(cursor, slotMinutes) <= end) {
    const slotEnd = addMinutes(cursor, slotMinutes);
    slots.push({ start: new Date(cursor), end: slotEnd });
    cursor = slotEnd;
  }

  return slots;
}

module.exports = {
  addMinutes,
  isOverlap,
  generateSlotsForDay,
};
