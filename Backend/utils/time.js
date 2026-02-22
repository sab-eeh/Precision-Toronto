// src/utils/time.js

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// 🌎 BUSINESS TIMEZONE (TORONTO)
const BUSINESS_TZ = "America/Toronto";

const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 20;

/** Create a Toronto-time date */
function toToronto(date) {
  return dayjs.tz(date, BUSINESS_TZ);
}

/** Return Date at given hour:minute in Toronto timezone */
function atHM(date, h, m = 0) {
  return toToronto(date).hour(h).minute(m).second(0).millisecond(0);
}

/** Window for business day in Toronto */
function businessWindow(cursor) {
  return {
    start: atHM(cursor, BUSINESS_START_HOUR),
    end: atHM(cursor, BUSINESS_END_HOUR),
  };
}

/** Next business day 08:00 Toronto */
function nextBusinessStart(cursor) {
  return toToronto(cursor)
    .add(1, "day")
    .hour(BUSINESS_START_HOUR)
    .minute(0)
    .second(0)
    .millisecond(0);
}

/** Clamp inside business hours */
function clampToBusinessStart(d) {
  const cur = toToronto(d);
  const { start, end } = businessWindow(cur);

  if (cur.isBefore(start)) return start;
  if (cur.isSame(end) || cur.isAfter(end)) return nextBusinessStart(cur);

  return cur;
}

/** Add business minutes (Toronto-safe) */
function addBusinessMinutes(startDate, minutes) {
  if (!Number.isFinite(minutes) || minutes < 0)
    throw new Error("minutes must be >= 0");

  let cur = clampToBusinessStart(startDate);
  let remain = Math.floor(minutes);

  while (remain > 0) {
    const { start, end } = businessWindow(cur);

    if (cur.isBefore(start)) cur = start;
    if (cur.isSame(end) || cur.isAfter(end)) {
      cur = nextBusinessStart(cur);
      continue;
    }

    const available = end.diff(cur, "minute");
    const use = Math.min(remain, available);

    cur = cur.add(use, "minute");
    remain -= use;

    if (remain > 0) cur = nextBusinessStart(cur);
  }

  return cur.toDate();
}

/** Generate slots (Toronto-based) */
function generateSlotsForDay(dayStart, { slotMinutes = 60 } = {}) {
  const start = atHM(dayStart, BUSINESS_START_HOUR);
  const end = atHM(dayStart, BUSINESS_END_HOUR);

  const slots = [];
  let t = start;

  while (t.isBefore(end)) {
    const slotEnd = t.add(slotMinutes, "minute");

    slots.push({
      start: t.toDate(),
      end: slotEnd.toDate(),
    });

    t = t.add(slotMinutes, "minute");
  }

  return slots;
}

/** Overlap check */
function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

module.exports = {
  BUSINESS_TZ,
  BUSINESS_START_HOUR,
  BUSINESS_END_HOUR,
  addBusinessMinutes,
  isOverlap,
  generateSlotsForDay,
  atHM,
};
