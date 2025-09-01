// utils/time.js

/**
 * Add minutes to a date.
 */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Generate time slots for a given day.
 * @param {Date} dayUTC Midnight UTC date for the day
 * @param {string} startHHMM "09:00"
 * @param {string} endHHMM "18:00"
 * @param {number} slotMinutes
 */
function generateSlotsForDay(dayUTC, startHHMM, endHHMM, slotMinutes) {
  const [startH, startM] = startHHMM.split(":").map(Number);
  const [endH, endM] = endHHMM.split(":").map(Number);

  const start = new Date(dayUTC);
  start.setUTCHours(startH, startM, 0, 0);

  const end = new Date(dayUTC);
  end.setUTCHours(endH, endM, 0, 0);

  const slots = [];
  let cur = new Date(start);
  while (cur < end) {
    slots.push(new Date(cur));
    cur = addMinutes(cur, slotMinutes);
  }
  return slots;
}

/**
 * Check if two intervals overlap
 */
function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

module.exports = { addMinutes, generateSlotsForDay, isOverlap };
