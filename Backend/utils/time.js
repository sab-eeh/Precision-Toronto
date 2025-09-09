// /utils/time.js
// Time utilities: minutes addition, business-minute addition (8am-8pm), overlap check, slot generation

const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 20;

/**
 * Add minutes to a Date (simple)
 */
function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + Number(minutes));
  return d;
}

/**
 * Add minutes while only counting business hours (8:00 - 20:00).
 * If the remaining minutes exceed today, continue at next day's business start.
 *
 * Example: start 2025-09-30 17:00, minutes=240 (4h)
 * - 17:00 -> 20:00 (3h used)
 * - remainder 1h -> next day 08:00 -> 09:00 => returns 2025-10-01 09:00
 */
function addBusinessMinutes(startDate, minutes) {
  let remaining = Number(minutes);
  let cursor = new Date(startDate);

  while (remaining > 0) {
    // Define today's business window
    const todayStart = new Date(cursor);
    todayStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);

    const todayEnd = new Date(cursor);
    todayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

    // If cursor before business start, jump to business start
    if (cursor < todayStart) cursor = new Date(todayStart);

    // If cursor is at/after today's business end -> move to next day 8am
    if (cursor >= todayEnd) {
      cursor = new Date(todayStart);
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }

    // Minutes available today from cursor
    const minsLeftToday = Math.floor((todayEnd - cursor) / 60000);
    if (remaining <= minsLeftToday) {
      cursor = addMinutes(cursor, remaining);
      remaining = 0;
      break;
    }

    // consume the rest of today's business minutes
    remaining -= minsLeftToday;
    cursor = new Date(todayEnd);
    // loop will move to next business day
  }

  return cursor;
}

/**
 * Check overlap for half-open intervals [aStart, aEnd) and [bStart, bEnd)
 */
function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Generate hourly slots for a given day within business hours.
 * Defaults: startHour = 8, endHour = 20, slotMinutes = 60
 */
function generateSlotsForDay(
  dayStart,
  {
    startHour = BUSINESS_START_HOUR,
    endHour = BUSINESS_END_HOUR,
    slotMinutes = 60,
  } = {}
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
  addBusinessMinutes,
  isOverlap,
  generateSlotsForDay,
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
};
