// src/utils/duration.js

// Parse duration string into { min, max, avg } in minutes
export const parseDuration = (str) => {
  if (!str) return null;
  const lower = str.toLowerCase();

  // Match ranges like "2–3 hrs" or "30-40 mins"
  const rangeMatch = lower.match(/(\d+)[–-](\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    if (lower.includes("min")) {
      return { min, max, avg: Math.round((min + max) / 2) }; // minutes
    }
    return {
      min: min * 60,
      max: max * 60,
      avg: Math.round(((min + max) / 2) * 60),
    }; // hours → minutes
  }

  // Match single values
  const hrMatch = lower.match(/(\d+)\s*h/);
  const minMatch = lower.match(/(\d+)\s*m/);
  let mins = 0;
  if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) mins += parseInt(minMatch[1], 10);

  return { min: mins, max: mins, avg: mins };
};

// Convert minutes → "xh ym"
export const formatDuration = (mins) => {
  if (!mins) return "Est. time";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
};

// Display string for a duration field like "2–3 hrs"
export const getDisplayDuration = (durationStr) => {
  const parsed = parseDuration(durationStr);
  if (!parsed) return "Est. time";
  if (parsed.min !== parsed.max) {
    return `${formatDuration(parsed.min)} – ${formatDuration(parsed.max)}`;
  }
  return formatDuration(parsed.min);
};
