// utils/time.js
const BUSINESS_START_HOUR = 8; // 08:00
const BUSINESS_END_HOUR = 20; // 20:00

function toDate(d) {
  const t = d instanceof Date ? d : new Date(d);
  if (isNaN(t)) throw new Error("Invalid Date");
  return t;
}
const clone = (d) => new Date(d.getTime());
function withTime(d, h = 0, m = 0, s = 0, ms = 0) {
  const x = clone(d);
  x.setHours(h, m, s, ms);
  return x;
}
function startOfDay(d) {
  const x = clone(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d, n) {
  const x = clone(d);
  x.setDate(x.getDate() + n);
  return x;
}
const min = (a, b) => (a < b ? a : b);
const max = (a, b) => (a > b ? a : b);

function bizWindowForDate(d) {
  const s = withTime(d, BUSINESS_START_HOUR, 0, 0, 0);
  const e = withTime(d, BUSINESS_END_HOUR, 0, 0, 0);
  return { start: s, end: e };
}

function nextBizStart(dLike) {
  const d = toDate(dLike);
  const { start, end } = bizWindowForDate(d);
  if (d < start) return start;
  if (d >= end) return bizWindowForDate(addDays(d, 1)).start;
  return d;
}

/** Add minutes only through business hours */
function addBusinessMinutes(startLike, minutes) {
  let current = nextBizStart(toDate(startLike));
  let remaining = Math.max(0, Math.floor(minutes));

  while (remaining > 0) {
    const { end } = bizWindowForDate(current);
    const roomMs = end.getTime() - current.getTime();
    if (roomMs <= 0) {
      current = bizWindowForDate(addDays(current, 1)).start;
      continue;
    }
    const roomMin = Math.floor(roomMs / 60000);
    if (remaining <= roomMin) {
      return new Date(current.getTime() + remaining * 60000);
    }
    remaining -= roomMin;
    current = bizWindowForDate(addDays(current, 1)).start;
  }
  return current;
}

/** Return [{ startAt, endAt, minutes }] across business days */
function splitIntoBusinessSegments(startLike, totalMinutes) {
  let cursor = nextBizStart(toDate(startLike));
  let remaining = Math.max(0, Math.floor(totalMinutes));
  const segments = [];

  while (remaining > 0) {
    const { end } = bizWindowForDate(cursor);
    if (cursor >= end) {
      cursor = bizWindowForDate(addDays(cursor, 1)).start;
      continue;
    }
    const todayRoomMin = Math.floor((end.getTime() - cursor.getTime()) / 60000);
    const take = Math.min(todayRoomMin, remaining);
    const segEnd = new Date(cursor.getTime() + take * 60000);

    segments.push({
      startAt: new Date(cursor),
      endAt: segEnd,
      minutes: take, // <-- aligned to schema/UI
    });

    remaining -= take;
    cursor = segEnd;
    if (cursor >= end && remaining > 0) {
      cursor = bizWindowForDate(addDays(cursor, 1)).start;
    }
  }
  return segments;
}

/** Generate fixed-size slots for the business day */
function generateSlotsForDay(dayLike, opts = {}) {
  const day = startOfDay(toDate(dayLike));
  const startHour = Number.isFinite(opts.startHour)
    ? opts.startHour
    : BUSINESS_START_HOUR;
  const endHour = Number.isFinite(opts.endHour)
    ? opts.endHour
    : BUSINESS_END_HOUR;
  const slotMin = Math.max(5, opts.slotMinutes || 60);

  const dayStart = withTime(day, startHour, 0, 0, 0);
  const dayEnd = withTime(day, endHour, 0, 0, 0);

  const out = [];
  for (let t = dayStart.getTime(); t < dayEnd.getTime(); t += slotMin * 60000) {
    const s = new Date(t);
    const e = new Date(min(t + slotMin * 60000, dayEnd.getTime()));
    out.push({ start: s, end: e });
  }
  return out;
}

/** Basic overlap */
function isOverlap(aStart, aEnd, bStart, bEnd) {
  const A = toDate(aStart).getTime();
  const B = toDate(aEnd).getTime();
  const C = toDate(bStart).getTime();
  const D = toDate(bEnd).getTime();
  return A < D && B > C;
}

/** Minutes overlapped between two ranges */
function minutesOverlap(aStart, aEnd, bStart, bEnd) {
  const A = toDate(aStart).getTime();
  const B = toDate(aEnd).getTime();
  const C = toDate(bStart).getTime();
  const D = toDate(bEnd).getTime();
  const ov = max(0, min(B, D) - max(A, C));
  return Math.floor(ov / 60000);
}

module.exports = {
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
  addBusinessMinutes,
  splitIntoBusinessSegments,
  generateSlotsForDay,
  isOverlap,
  minutesOverlap,
};
