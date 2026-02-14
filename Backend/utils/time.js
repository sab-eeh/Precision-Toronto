// src/utils/time.js
// Business-hours scheduling helpers: 08:00–20:00

const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 20;
const MINUTES_PER_DAY = 24 * 60;

/** Return Date at given hour:minute on the same calendar day (local time). */
function atHM(date, h, m = 0) {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Window for the business day containing `cursor`. */
function businessWindow(cursor) {
  return {
    start: atHM(cursor, BUSINESS_START_HOUR),
    end: atHM(cursor, BUSINESS_END_HOUR),
  };
}

/** Move to the next business day's start. */
function nextBusinessStart(cursor) {
  const d = new Date(cursor);
  // Go to next day 08:00
  d.setDate(d.getDate() + 1);
  d.setHours(BUSINESS_START_HOUR, 0, 0, 0);
  return d;
}

/** Clamp a given Date into business hours: if before 08:00 -> 08:00; if after 20:00 -> next day 08:00. */
function clampToBusinessStart(d) {
  const { start, end } = businessWindow(d);
  if (d < start) return start;
  if (d >= end) return nextBusinessStart(d);
  return new Date(d);
}

/**
 * Add minutes counting ONLY business time.
 * Example: addBusinessMinutes(21 Oct 17:00, 1800) => 24 Oct 11:00
 */
function addBusinessMinutes(startDate, minutes) {
  if (!Number.isFinite(minutes) || minutes < 0)
    throw new Error("minutes must be >= 0");
  let cur = clampToBusinessStart(new Date(startDate));
  let remain = Math.floor(minutes);

  while (remain > 0) {
    const { start, end } = businessWindow(cur);
    // ensure inside the window
    if (cur < start) cur = start;
    if (cur >= end) {
      cur = nextBusinessStart(cur);
      continue;
    }
    const available = Math.floor((end - cur) / 60000);
    const use = Math.min(remain, available);
    cur = new Date(cur.getTime() + use * 60000);
    remain -= use;
    if (remain > 0) cur = nextBusinessStart(cur);
  }

  return cur;
}

/** Split a block of business minutes into per-day working segments (useful for UI, audits, admin views). */
function splitIntoBusinessSegments(startDate, minutes) {
  const segments = [];
  let cur = clampToBusinessStart(new Date(startDate));
  let remain = Math.floor(minutes);

  while (remain > 0) {
    const { start, end } = businessWindow(cur);
    if (cur < start) cur = start;
    if (cur >= end) {
      cur = nextBusinessStart(cur);
      continue;
    }
    const available = Math.floor((end - cur) / 60000);
    const use = Math.min(remain, available);
    const segEnd = new Date(cur.getTime() + use * 60000);
    segments.push({ start: cur, end: segEnd });
    cur = segEnd;
    remain -= use;
    if (remain > 0) cur = nextBusinessStart(cur);
  }

  return segments;
}

/** Simple overlap check. */
function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/** Generate start-of-hour (or custom) slots for a day. */
function generateSlotsForDay(
  dayStart,
  {
    startHour = BUSINESS_START_HOUR,
    endHour = BUSINESS_END_HOUR,
    slotMinutes = 60,
  } = {}
) {
  const start = atHM(dayStart, startHour);
  const end = atHM(dayStart, endHour);
  const out = [];
  for (
    let t = new Date(start);
    t < end;
    t = new Date(t.getTime() + slotMinutes * 60000)
  ) {
    const slotEnd = new Date(t.getTime() + slotMinutes * 60000);
    out.push({ start: new Date(t), end: slotEnd });
  }
  return out;
}

module.exports = {
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
  addBusinessMinutes,
  splitIntoBusinessSegments,
  isOverlap,
  generateSlotsForDay,
  atHM,
};
