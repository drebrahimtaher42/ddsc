export const REMOTE_LIVE_CONFIG_URL =
  'https://gist.githubusercontent.com/drebrahimtaher42/684ca53df6f22b4dcc19911481e32a8a/raw/ddsc-live-config.json';

export const DEFAULT_LIVE_CONFIG = {
  liveEnabled: true,
  alDiwanDelayMinutes: 0,
  alDiwanShiftFullSchedule: false,
  princessDelayMinutes: 0,
  princessShiftFullSchedule: false,
};

export function normalizeLiveConfig(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_LIVE_CONFIG };
  const toDelay = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? Math.round(n) : 0;
  };
  return {
    liveEnabled:
      typeof raw.liveEnabled === 'boolean'
        ? raw.liveEnabled
        : DEFAULT_LIVE_CONFIG.liveEnabled,
    alDiwanDelayMinutes: toDelay(raw.alDiwanDelayMinutes),
    alDiwanShiftFullSchedule: Boolean(raw.alDiwanShiftFullSchedule),
    princessDelayMinutes: toDelay(raw.princessDelayMinutes),
    princessShiftFullSchedule: Boolean(raw.princessShiftFullSchedule),
  };
}

export function shiftTime24(time24, delayMinutes) {
  if (!time24 || !delayMinutes) return time24;
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time24;
  const total = (((hour * 60 + minute + delayMinutes) % 1440) + 1440) % 1440;
  const newH = String(Math.floor(total / 60)).padStart(2, '0');
  const newM = String(total % 60).padStart(2, '0');
  return `${newH}:${newM}`;
}

export function shiftSessionByMinutes(session, delayMinutes, isShifted = false) {
  const mins = Number(delayMinutes) || 0;
  if (!session || mins === 0) {
    return session;
  }
  const shiftMs = mins * 60000;
  return {
    ...session,
    originalStartTime: session.originalStartTime || session.startTime,
    originalEndTime: session.originalEndTime || session.endTime,
    startTime: shiftTime24(session.startTime, mins),
    endTime: shiftTime24(session.endTime, mins),
    startIso: new Date(Date.parse(session.startIso) + shiftMs).toISOString(),
    endIso: new Date(Date.parse(session.endIso) + shiftMs).toISOString(),
    delayMinutes: mins,
    isShifted,
  };
}

export const PREVIEW_PRESETS = [
  {
    id: 'd1-morning',
    label: 'Day 1 · 11:15 AM',
    description: 'Concurrent halls live',
    iso: '2026-11-26T11:15:00+02:00',
  },
  {
    id: 'd2-prayer',
    label: 'Day 2 · 11:45 AM',
    description: 'Friday Prayer break',
    iso: '2026-11-27T11:45:00+02:00',
  },
  {
    id: 'd2-afternoon',
    label: 'Day 2 · 1:15 PM',
    description: 'Day 2 halls live',
    iso: '2026-11-27T13:15:00+02:00',
  },
];

/**
 * Formats a 24-hour "HH:MM" string into accurate 12-hour "H:MM AM/PM" format.
 */
export function formatTime12h(time24) {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr} ${suffix}`;
}

export function formatTimeRange(startTime, endTime) {
  return `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
}

export function formatCompactTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return '';
  const startFull = formatTime12h(startTime);
  const endFull = formatTime12h(endTime);
  const [startClock, startMeridiem] = startFull.split(' ');
  const [, endMeridiem] = endFull.split(' ');
  if (startMeridiem && startMeridiem === endMeridiem) {
    return `${startClock}–${endFull}`;
  }
  return `${startFull}–${endFull}`;
}

/**
 * Formats an instant in Africa/Cairo timezone, e.g. "10:35 AM"
 */
export function formatCairoClock(nowMs) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(nowMs));
  } catch {
    const d = new Date(nowMs);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

export function formatCairoDayShort(nowMs) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(nowMs));
  } catch {
    return '';
  }
}

export function getCountdownParts(targetMs, nowMs) {
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isComplete: diff <= 0 };
}

export function getMinutesRemaining(endIso, nowMs) {
  const diffMs = Date.parse(endIso) - nowMs;
  return Math.max(1, Math.ceil(diffMs / 60000));
}

/**
 * Evaluates live conference status comparing nowMs against ISO +02:00 Cairo timestamps,
 * applying per-hall delay offsets (alDiwanDelayMinutes, princessDelayMinutes) to Live Mode.
 */
export function getLiveConferenceState(
  nowMs,
  schedule,
  conference,
  liveConfig = DEFAULT_LIVE_CONFIG
) {
  const cfg = normalizeLiveConfig(liveConfig);
  const liveSchedule = schedule.map((item) => {
    if (item.type !== 'session') return item;
    if (item.hall === 'diwan' && cfg.alDiwanDelayMinutes) {
      return shiftSessionByMinutes(item, cfg.alDiwanDelayMinutes, true);
    }
    if (item.hall === 'princess' && cfg.princessDelayMinutes) {
      return shiftSessionByMinutes(item, cfg.princessDelayMinutes, true);
    }
    return item;
  });

  const openingMs = Date.parse(conference.openingCeremonyIso);
  const conferenceEndMs = Math.max(
    Date.parse(conference.conferenceEndIso),
    ...liveSchedule.map((item) => Date.parse(item.endIso))
  );
  const firstEventMs = Math.min(...liveSchedule.map((item) => Date.parse(item.startIso)));

  const countdown = getCountdownParts(openingMs, nowMs);

  // Before conference day begins (before first scheduled item on Nov 26)
  if (nowMs < firstEventMs) {
    return {
      phase: 'before',
      countdown,
      liveSessions: [],
      livePrincess: null,
      liveDiwan: null,
      liveSpecial: null,
      upNext: [],
      upNextPrincess: null,
      upNextDiwan: null,
      liveIds: new Set(),
    };
  }

  // After the final session ends
  if (nowMs >= conferenceEndMs) {
    return {
      phase: 'after',
      countdown,
      liveSessions: [],
      livePrincess: null,
      liveDiwan: null,
      liveSpecial: null,
      upNext: [],
      upNextPrincess: null,
      upNextDiwan: null,
      liveIds: new Set(),
    };
  }

  // Active conference window (26–27 Nov 2026)
  const liveSessions = liveSchedule.filter((item) => {
    const start = Date.parse(item.startIso);
    const end = Date.parse(item.endIso);
    return nowMs >= start && nowMs < end;
  });

  const livePrincess = liveSessions.find((s) => s.type === 'session' && s.hall === 'princess') || null;
  const liveDiwan = liveSessions.find((s) => s.type === 'session' && s.hall === 'diwan') || null;
  const liveSpecial = liveSessions.find((s) => s.type === 'special') || null;
  const liveIds = new Set(liveSessions.map((s) => s.id));

  // Find earliest upcoming event(s)
  const upcoming = liveSchedule
    .filter((item) => Date.parse(item.startIso) > nowMs)
    .sort((a, b) => Date.parse(a.startIso) - Date.parse(b.startIso));

  let upNext = [];
  if (upcoming.length > 0) {
    const nextStartMs = Date.parse(upcoming[0].startIso);
    // Group concurrent events starting at the same next slot
    upNext = upcoming.filter((item) => Date.parse(item.startIso) === nextStartMs);
  }

  const activeDay =
    (livePrincess || liveDiwan || liveSpecial || upcoming[0])?.day || null;

  const upNextPrincess =
    upcoming.find(
      (item) =>
        item.type === 'session' &&
        item.hall === 'princess' &&
        (!activeDay || item.day === activeDay)
    ) || null;

  const upNextDiwan =
    upcoming.find(
      (item) =>
        item.type === 'session' &&
        item.hall === 'diwan' &&
        (!activeDay || item.day === activeDay)
    ) || null;

  const phase = liveSessions.length > 0 ? 'live' : 'between';

  return {
    phase,
    countdown,
    liveSessions,
    livePrincess,
    liveDiwan,
    liveSpecial,
    upNext,
    upNextPrincess,
    upNextDiwan,
    liveIds,
  };
}

export function buildWhatsAppUrl(number, message) {
  const cleanNumber = String(number || '').replace(/[^0-9A-Za-z]/g, '');
  const encodedText = encodeURIComponent(message || '');
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
