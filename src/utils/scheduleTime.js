/**
 * Single Source of Truth for DDSC 2026 session time windows & real-time statuses
 * ('upcoming' | 'live' | 'ended') in Africa/Cairo (UTC+2).
 *
 * Dynamically parses each session's date + startTime/endTime + active per-hall
 * delay offsets so edits to schedule data or post-build dist files stay 100%
 * conflict-free across the top Live banner and all schedule cards.
 */

export function parseClockMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3] ? match[3].toUpperCase() : null;

  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minute;
}

export function resolveSessionDateStr(item, conference) {
  if (item?.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
    return item.date;
  }
  const matchedDay = conference?.days?.find((d) => d.id === item?.day);
  if (matchedDay?.date) return matchedDay.date;
  return item?.day === 'day2' ? '2026-11-27' : '2026-11-26';
}

export function getHallDelayMinutes(item, liveConfig) {
  if (!item || item.type !== 'session' || !liveConfig) return 0;
  if (item.hall === 'diwan') {
    const n = Number(liveConfig.alDiwanDelayMinutes);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  if (item.hall === 'princess') {
    const n = Number(liveConfig.princessDelayMinutes);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  return 0;
}

/**
 * Returns the effective [effectiveStartMs, effectiveEndMs) interval in UTC ms
 * for any session or special event, dynamically derived from its time strings
 * in Africa/Cairo (+02:00) plus any active hall delay.
 */
export function getSessionWindowMs(item, conference, liveConfig) {
  const dateStr = resolveSessionDateStr(item, conference);
  const dayMidnightMs = Date.parse(`${dateStr}T00:00:00+02:00`);

  const baseStartStr = item?.originalStartTime || item?.startTime;
  const baseEndStr = item?.originalEndTime || item?.endTime;

  const startMins = parseClockMinutes(baseStartStr);
  const endMins = parseClockMinutes(baseEndStr);
  const delayMins = getHallDelayMinutes(item, liveConfig);

  const effectiveStartMs = dayMidnightMs + (startMins + delayMins) * 60000;
  const effectiveEndMs = dayMidnightMs + (endMins + delayMins) * 60000;

  return {
    effectiveStartMs,
    effectiveEndMs,
    delayMins,
  };
}

/**
 * Half-open interval status check [effectiveStartMs, effectiveEndMs):
 * - nowMs < effectiveStartMs => 'upcoming'
 * - nowMs >= effectiveStartMs && nowMs < effectiveEndMs => 'live'
 * - nowMs >= effectiveEndMs => 'ended'
 */
export function getSessionStatus(item, nowMs, conference, liveConfig) {
  const { effectiveStartMs, effectiveEndMs } = getSessionWindowMs(
    item,
    conference,
    liveConfig
  );
  if (nowMs < effectiveStartMs) return 'upcoming';
  if (nowMs >= effectiveStartMs && nowMs < effectiveEndMs) return 'live';
  return 'ended';
}

/**
 * Dynamically finds Day 1's 2nd distinct regular lecture time slot after the
 * Opening Ceremony and returns its midpoint timestamp (ms), so toggling Live
 * Preview simultaneously showcases Ended (Opening + 1st slot), LIVE NOW (2nd slot),
 * and Upcoming (3rd slot onward).
 */
export function getSecondLecturePreviewMs(schedule, conference, liveConfig) {
  const fallbackMs = Date.parse('2026-11-26T12:05:00+02:00');
  if (!Array.isArray(schedule) || schedule.length === 0) return fallbackMs;

  const day1Sessions = schedule
    .filter((item) => item.day === 'day1' && item.type === 'session')
    .map((item) => ({
      item,
      ...getSessionWindowMs(item, conference, liveConfig),
    }))
    .sort((a, b) => a.effectiveStartMs - b.effectiveStartMs);

  if (day1Sessions.length === 0) return fallbackMs;

  const distinctSlots = [];
  for (const entry of day1Sessions) {
    const existing = distinctSlots.find(
      (slot) => slot.effectiveStartMs === entry.effectiveStartMs
    );
    if (!existing) {
      distinctSlots.push(entry);
    }
  }

  const targetSlot = distinctSlots[1] || distinctSlots[0];
  return Math.round(
    (targetSlot.effectiveStartMs + targetSlot.effectiveEndMs) / 2
  );
}
