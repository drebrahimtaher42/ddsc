import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Bookmark,
  Clock,
  Coffee,
  Sparkles,
  Utensils,
  Moon,
  ClipboardCheck,
  BookmarkCheck,
  Check,
  ChevronDown,
  Mic,
  FileImage,
  Download,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';
import { LiveBanner } from './LiveBanner';
import { PostersShowcase } from './PostersShowcase';
import { SectionHeading } from './SectionHeading';
import {
  REMOTE_LIVE_CONFIG_URL,
  DEFAULT_LIVE_CONFIG,
  normalizeLiveConfig,
  shiftSessionByMinutes,
  getLiveConferenceState,
  getSessionStatus,
  getSecondLecturePreviewMs,
  formatTime12h,
  formatTimeRange,
  formatCompactTimeRange,
} from '../utils/time';
import { specialtyPillStyle, getSpecialtyColor } from '../utils/specialty';
import {
  staggerListVariants,
  cardItemVariants,
  lightboxZoomVariants,
  EASE_OUT,
} from '../utils/motion';

const PILL_SPRING = { type: 'spring', stiffness: 460, damping: 36 };

const SCHEDULE_POSTERS = {
  'day1-diwan': {
    src: '/schedules/day1-diwan.jpg',
    label: 'Day 1 · 26 Nov — Al Diwan Hall',
    downloadName: 'DDSC-2026-Day1-Al-Diwan-Schedule.jpg',
  },
  'day1-princess': {
    src: '/schedules/day1-princess.jpg',
    label: 'Day 1 · 26 Nov — Princess Hall',
    downloadName: 'DDSC-2026-Day1-Princess-Schedule.jpg',
  },
  'day2-diwan': {
    src: '/schedules/day2-diwan.jpg',
    label: 'Day 2 · 27 Nov — Al Diwan Hall',
    downloadName: 'DDSC-2026-Day2-Al-Diwan-Schedule.jpg',
  },
  'day2-princess': {
    src: '/schedules/day2-princess.jpg',
    label: 'Day 2 · 27 Nov — Princess Hall',
    downloadName: 'DDSC-2026-Day2-Princess-Schedule.jpg',
  },
};

function SchedulePostersModal({ isOpen, initialDay, initialHall, onClose }) {
  const [posterDay, setPosterDay] = useState(initialDay || 'day1');
  const [posterHall, setPosterHall] = useState(
    initialHall === 'princess' ? 'princess' : 'diwan'
  );
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPosterDay(initialDay || 'day1');
    setPosterHall(initialHall === 'princess' ? 'princess' : 'diwan');
    setZoomed(false);
  }, [isOpen, initialDay, initialHall]);

  useEffect(() => {
    setZoomed(false);
  }, [posterDay, posterHall]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const currentKey = `${posterDay}-${posterHall}`;
  const currentPoster = SCHEDULE_POSTERS[currentKey] || SCHEDULE_POSTERS['day1-diwan'];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="schedule-posters-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0B1B35]/85 backdrop-blur-md p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label="Official Schedule Posters"
          onClick={onClose}
        >
          {/* Top Switcher Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-2.5 text-white backdrop-blur-md shadow-lg"
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <FileImage className="h-4 w-4 shrink-0 text-[#5EEAD4]" />
                <span className="truncate font-display text-xs sm:text-sm font-bold text-white">
                  Official Schedule Posters
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/85 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close schedule posters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {/* Day Switcher Pills */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1">
                {[
                  { id: 'day1', label: 'Day 1 · 26 Nov' },
                  { id: 'day2', label: 'Day 2 · 27 Nov' },
                ].map((d) => {
                  const active = posterDay === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setPosterDay(d.id)}
                      className={`rounded-lg py-1.5 px-2.5 font-display text-xs font-bold transition-all ${
                        active
                          ? 'bg-white text-[#0D224C] shadow-xs'
                          : 'text-white/75 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              {/* Hall Switcher Pills */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/25 p-1">
                {[
                  { id: 'diwan', label: 'Al Diwan Hall', dot: '#3AB498' },
                  { id: 'princess', label: 'Princess Hall', dot: '#93C5FD' },
                ].map((h) => {
                  const active = posterHall === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setPosterHall(h.id)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2.5 font-display text-xs font-bold transition-all ${
                        active
                          ? 'bg-[#3AB498] text-[#06201B] shadow-xs'
                          : 'text-white/75 hover:text-white'
                      }`}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: active ? '#06201B' : h.dot }}
                      />
                      <span>{h.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Zoomable/Scrollable Poster Viewer */}
          <motion.div
            key={currentKey}
            variants={lightboxZoomVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative my-2 flex-1 w-full max-w-2xl overflow-auto rounded-2xl border border-white/15 bg-[#0B192C] shadow-2xl flex items-start justify-center"
          >
            <div
              className={`min-h-full flex items-center justify-center p-2 ${
                zoomed ? 'w-[180%] min-w-[640px]' : 'w-full h-full'
              }`}
            >
              <img
                src={currentPoster.src}
                alt={currentPoster.label}
                onClick={() => setZoomed((z) => !z)}
                className={`select-none rounded-xl transition-all duration-200 ${
                  zoomed
                    ? 'w-full h-auto cursor-zoom-out'
                    : 'max-h-[65vh] w-auto max-w-full object-contain cursor-zoom-in'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="fixed sm:absolute bottom-20 sm:bottom-3 right-5 sm:right-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 font-display text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/80"
            >
              {zoomed ? (
                <>
                  <ZoomOut className="h-3.5 w-3.5 text-[#5EEAD4]" />
                  <span>Reset 1x</span>
                </>
              ) : (
                <>
                  <ZoomIn className="h-3.5 w-3.5 text-[#5EEAD4]" />
                  <span>Tap to Zoom 1.8x</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Bottom Download Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur-md"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-xs sm:text-sm font-bold text-white">
                {currentPoster.label}
              </p>
              <p className="truncate text-[11px] text-slate-300">
                High-resolution official timetable poster
              </p>
            </div>

            <a
              href={currentPoster.src}
              download={currentPoster.downloadName}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB498] to-[#2EA389] px-4 py-2.5 font-display text-xs font-bold text-[#06201B] shadow-md transition-all hover:brightness-105 active:scale-98"
            >
              <Download className="h-4 w-4" />
              <span>Download Poster</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function getSpecialIcon(kind) {
  switch (kind) {
    case 'ceremony':
      return Sparkles;
    case 'prayer':
      return Moon;
    case 'lunch':
      return Utensils;
    case 'registration':
      return ClipboardCheck;
    default:
      return Coffee;
  }
}

function splitTime(time24) {
  const formatted = formatTime12h(time24); // "10:15 AM"
  const [clock, period] = formatted.split(' ');
  return { clock, period };
}

function durationMinutes(item) {
  return Math.round((Date.parse(item.endIso) - Date.parse(item.startIso)) / 60000);
}

/** Generic animated segmented pill row (layoutId active indicator). */
function PillRow({ options, value, onChange, layoutId, size = 'md' }) {
  const pad =
    size === 'xs'
      ? 'px-2.5 py-1 text-[11.5px]'
      : size === 'sm'
      ? 'px-3 py-1.5 text-[11px]'
      : 'px-3.5 py-1.5 text-xs';
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <motion.button
            key={opt.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-display font-semibold transition-colors duration-200 ${pad} ${
              active ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={PILL_SPRING}
                className="absolute inset-0 rounded-full bg-[#0D224C] shadow-sm"
                aria-hidden="true"
              />
            )}
            {opt.dot && (
              <span
                className="relative z-10 h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? '#3AB498' : opt.dot }}
              />
            )}
            {opt.icon && <opt.icon className="relative z-10 h-3.5 w-3.5" />}
            <span className="relative z-10">{opt.label}</span>
            {typeof opt.count === 'number' && opt.count > 0 && (
              <span
                className={`relative z-10 rounded-full px-1.5 text-[10px] font-bold ${
                  active ? 'bg-[#3AB498] text-[#0B192C]' : 'bg-[#3AB498]/15 text-[#086958]'
                }`}
              >
                {opt.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

function TicketSpeakerAvatar({ speaker, speakerName, isPrincess }) {
  const src = speaker?.avatar || speaker?.photo || null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={speakerName}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-10 h-10 rounded-full object-cover object-top shrink-0 border-2 border-white shadow-sm ${
          isPrincess ? 'ring-2 ring-[#0F2544]/25' : 'ring-2 ring-[#0E6F64]/25'
        }`}
      />
    );
  }

  return (
    <div
      className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
        isPrincess
          ? 'bg-[#0F2544]/10 text-[#0F2544]'
          : 'bg-[#0E6F64]/10 text-[#0E6F64]'
      }`}
    >
      <Mic className="h-4 w-4" />
    </div>
  );
}

function TimeBlock({ item, tone = 'default' }) {
  const start = splitTime(item.startTime);
  const end = formatTime12h(item.endTime);
  const mins = durationMinutes(item);
  const isCeremony = tone === 'ceremony';
  const isSpecial = tone === 'special';
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-baseline gap-1">
        <span
          className={`font-display text-[17px] sm:text-xl font-extrabold leading-none tracking-tight tabular-nums ${
            isCeremony
              ? 'text-white'
              : isSpecial
              ? 'text-[#086958]'
              : 'text-[#0D224C]'
          }`}
        >
          {start.clock}
        </span>
        <span
          className={`font-display text-[10px] font-bold uppercase ${
            isCeremony ? 'text-[#A7F3D0]' : 'text-[#64748B]'
          }`}
        >
          {start.period}
        </span>
      </div>
      <span
        className={`mt-1.5 whitespace-nowrap text-[11px] font-medium leading-tight tabular-nums ${
          isCeremony ? 'text-white/80' : 'text-[#64748B]'
        }`}
      >
        to {end}
      </span>
      <span
        className={`mt-1 hidden sm:inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
          isCeremony
            ? 'bg-white/15 text-[#A7F3D0]'
            : 'bg-[#0D224C]/[0.05] text-[#64748B]'
        }`}
      >
        {mins} min
      </span>
    </div>
  );
}

export function ScheduleView({
  schedule,
  posters,
  conference,
  liveState,
  nowMs,
  previewPresetId,
  canPreviewLive = false,
  onTogglePreview,
  onSelectPreset,
  savedIds,
  isSaved,
  onToggleSave,
  onSelectSession,
  speakersById = {},
}) {
  const [selectedDay, setSelectedDay] = useState('day1');
  const [hallFilter, setHallFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [specialtyOpen, setSpecialtyOpen] = useState(false);
  const [postersModalOpen, setPostersModalOpen] = useState(false);
  const [liveConfig, setLiveConfig] = useState(DEFAULT_LIVE_CONFIG);
  const [tickNowMs, setTickNowMs] = useState(() => Date.now());

  useEffect(() => {
    const tickId = window.setInterval(() => {
      setTickNowMs(Date.now());
    }, 30000);
    return () => window.clearInterval(tickId);
  }, []);

  useEffect(() => {
    if (previewPresetId === 'd1-slot2') {
      setSelectedDay('day1');
    } else if (previewPresetId?.startsWith('d2-')) {
      setSelectedDay('day2');
    }
  }, [previewPresetId]);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveConfig = async () => {
      try {
        const res = await fetch(`${REMOTE_LIVE_CONFIG_URL}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data && typeof data === 'object') {
          setLiveConfig(normalizeLiveConfig(data));
        }
      } catch {
        // Fallback silently to current / default config when offline or unreachable
      }
    };

    fetchLiveConfig();
    const intervalId = window.setInterval(fetchLiveConfig, 60000);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const effectiveClockMs = useMemo(() => {
    if (canPreviewLive && previewPresetId === 'd1-slot2') {
      return getSecondLecturePreviewMs(schedule, conference, liveConfig);
    }
    if (canPreviewLive && previewPresetId) return nowMs;
    return nowMs || tickNowMs;
  }, [canPreviewLive, previewPresetId, schedule, conference, liveConfig, nowMs, tickNowMs]);

  const effectiveLiveState = useMemo(
    () =>
      schedule && conference
        ? getLiveConferenceState(effectiveClockMs, schedule, conference, liveConfig)
        : liveState,
    [effectiveClockMs, schedule, conference, liveConfig, liveState]
  );

  const displaySchedule = useMemo(() => {
    const shiftDiwan =
      liveConfig.alDiwanShiftFullSchedule && liveConfig.alDiwanDelayMinutes > 0;
    const shiftPrincess =
      liveConfig.princessShiftFullSchedule && liveConfig.princessDelayMinutes > 0;

    if (!shiftDiwan && !shiftPrincess) return schedule;

    return schedule.map((item) => {
      if (item.type !== 'session') return item;
      if (item.hall === 'diwan' && shiftDiwan) {
        return shiftSessionByMinutes(item, liveConfig.alDiwanDelayMinutes, true);
      }
      if (item.hall === 'princess' && shiftPrincess) {
        return shiftSessionByMinutes(item, liveConfig.princessDelayMinutes, true);
      }
      return item;
    });
  }, [schedule, liveConfig]);

  const dayItems = useMemo(
    () => displaySchedule.filter((item) => item.day === selectedDay),
    [displaySchedule, selectedDay]
  );

  const specialtyOptions = useMemo(() => {
    const set = new Set(
      schedule.filter((s) => s.type === 'session' && s.specialty).map((s) => s.specialty)
    );
    return [
      { id: 'all', label: 'All Specialties' },
      ...Array.from(set).map((sp) => ({ id: sp, label: sp, dot: getSpecialtyColor(sp) })),
    ];
  }, [schedule]);

  const savedCountForDay = useMemo(
    () => dayItems.filter((i) => i.type === 'session' && savedIds.includes(i.id)).length,
    [dayItems, savedIds]
  );

  const filteredItems = useMemo(() => {
    let items = dayItems;
    if (hallFilter === 'saved') {
      items = items.filter((i) => i.type === 'session' && savedIds.includes(i.id));
    } else if (hallFilter !== 'all') {
      items = items.filter((i) => i.type === 'special' || i.hall === hallFilter);
    }
    if (specialtyFilter !== 'all') {
      items = items.filter((i) => i.type === 'session' && i.specialty === specialtyFilter);
    }
    return items;
  }, [dayItems, hallFilter, specialtyFilter, savedIds]);

  const sessionCount = dayItems.filter((i) => i.type === 'session').length;

  const hallOptions = [
    { id: 'all', label: 'All' },
    { id: 'diwan', label: 'Al Diwan', dot: '#086958' },
    { id: 'princess', label: 'Princess', dot: '#0D224C' },
    { id: 'saved', label: 'Saved', icon: Bookmark, count: savedCountForDay },
  ];

  const activeDay = conference.days.find((d) => d.id === selectedDay);
  const filtersActive = hallFilter !== 'all' || specialtyFilter !== 'all';
  const showSpecialties = specialtyOpen || specialtyFilter !== 'all';

  return (
    <div className="space-y-6">
      {liveConfig.liveEnabled !== false && (
        <LiveBanner
          liveState={effectiveLiveState}
          nowMs={effectiveClockMs}
          previewPresetId={previewPresetId}
          canPreviewLive={canPreviewLive}
          onTogglePreview={onTogglePreview}
          onSelectPreset={onSelectPreset}
          onSelectSession={onSelectSession}
          conference={conference}
        />
      )}

      <SectionHeading
        eyebrow="Scientific Programme"
        title="Conference Agenda"
        description={`${activeDay?.fullLabel} · ${sessionCount} accredited lectures across two parallel halls.`}
      />

      {/* Compact Sticky Glass Filter Bar (ONLY Day Switcher + Hall/Saved Filters) */}
      <LayoutGroup id="schedule-filters">
        <div className="sticky top-[62px] sm:top-[68px] z-30 rounded-2xl p-2 bg-white/85 backdrop-blur-xl border border-slate-200/70 shadow-sm">
          {/* 1. Single-Line Day Switcher */}
          <div
            role="tablist"
            aria-label="Conference Days"
            className="grid grid-cols-2 gap-1 rounded-xl bg-[#0D224C]/[0.05] p-0.5"
          >
            {conference.days.map((day) => {
              const active = selectedDay === day.id;
              const compactDate = day.dayDate.replace(/^[A-Za-z]+,\s*/, '');
              return (
                <motion.button
                  key={day.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDay(day.id)}
                  className="relative rounded-[10px] py-1.5 px-3 text-center"
                >
                  {active && (
                    <motion.span
                      layoutId="dayPill"
                      transition={PILL_SPRING}
                      className="absolute inset-0 rounded-[10px] bg-white shadow-sm ring-1 ring-[#0D224C]/[0.06]"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`relative z-10 block whitespace-nowrap font-display text-xs font-bold transition-colors ${
                      active ? 'text-[#0D224C]' : 'text-[#64748B]'
                    }`}
                  >
                    {day.shortLabel}
                    <span
                      className={`mx-1 font-normal ${
                        active ? 'text-[#3AB498]' : 'text-[#94A3B8]'
                      }`}
                    >
                      ·
                    </span>
                    <span className={active ? 'text-[#086958]' : 'font-medium text-[#64748B]'}>
                      {compactDate}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* 2. Hall & Saved Filter Strip */}
          <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {hallOptions.map((opt) => {
              const active = hallFilter === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setHallFilter(opt.id)}
                  aria-pressed={active}
                  className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 font-display text-[11.5px] font-semibold transition-colors duration-200 ${
                    active ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="hallPill"
                      transition={PILL_SPRING}
                      className="absolute inset-0 rounded-full bg-[#0D224C] shadow-xs"
                      aria-hidden="true"
                    />
                  )}
                  {opt.dot && (
                    <span
                      className="relative z-10 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: active ? '#3AB498' : opt.dot }}
                    />
                  )}
                  {opt.icon && <opt.icon className="relative z-10 h-3 w-3" />}
                  <span className="relative z-10">{opt.label}</span>
                  {typeof opt.count === 'number' && opt.count > 0 && (
                    <span
                      className={`relative z-10 rounded-full px-1.5 text-[10px] font-bold ${
                        active ? 'bg-[#3AB498] text-[#0B192C]' : 'bg-[#3AB498]/15 text-[#086958]'
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scroll-Away Secondary Controls: 2-Column Grid for Specialty + Full Schedule */}
        <div className="!mt-2.5 space-y-2">
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              aria-expanded={showSpecialties}
              onClick={() => {
                if (specialtyFilter !== 'all') {
                  setSpecialtyFilter('all');
                  setSpecialtyOpen(false);
                } else {
                  setSpecialtyOpen((prev) => !prev);
                }
              }}
              className={`inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 font-display text-xs font-semibold shadow-2xs transition-colors duration-200 ${
                specialtyFilter !== 'all'
                  ? 'border-[#3AB498]/45 bg-[#3AB498]/15 text-[#086958]'
                  : showSpecialties
                  ? 'border-[#0D224C]/20 bg-[#0D224C]/[0.07] text-[#0D224C]'
                  : 'border-slate-200/80 bg-white text-[#475569] hover:border-slate-300 hover:text-[#0D224C]'
              }`}
            >
              {specialtyFilter !== 'all' && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getSpecialtyColor(specialtyFilter) }}
                />
              )}
              <span className="truncate">
                {specialtyFilter !== 'all' ? specialtyFilter : 'Specialty'}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  showSpecialties ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setPostersModalOpen(true)}
              className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#086958]/25 bg-white px-3 py-2 font-display text-xs font-bold text-[#086958] shadow-2xs transition-all hover:border-[#086958]/50 hover:bg-[#3AB498]/10"
            >
              <FileImage className="h-3.5 w-3.5 shrink-0 text-[#086958]" />
              <span className="truncate">Full Schedule</span>
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {showSpecialties && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xs">
                  <PillRow
                    options={specialtyOptions}
                    value={specialtyFilter}
                    onChange={(val) => {
                      setSpecialtyFilter(val);
                      if (val === 'all') setSpecialtyOpen(false);
                    }}
                    layoutId="specialtyPill"
                    size="xs"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {/* Agenda list */}
      <motion.ol
        key={`${selectedDay}-${hallFilter}-${specialtyFilter}`}
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3.5"
      >
        {filteredItems.length === 0 ? (
          <motion.li
            variants={cardItemVariants}
            className="rounded-2xl border border-slate-200/70 bg-white px-6 py-12 text-center shadow-card"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3AB498]/15 text-[#086958]">
              <BookmarkCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold tracking-tight text-[#0B192C]">
              {hallFilter === 'saved'
                ? `No saved lectures on ${activeDay?.shortLabel} yet`
                : 'No lectures match these filters'}
            </h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-[#64748B]">
              {hallFilter === 'saved'
                ? 'Tap the bookmark on any lecture to build your personal itinerary.'
                : 'Try another hall or specialty to see more of the programme.'}
            </p>
            {filtersActive && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setHallFilter('all');
                  setSpecialtyFilter('all');
                }}
                className="mt-5 inline-flex items-center rounded-full bg-[#0D224C] px-4 py-2 font-display text-xs font-semibold text-white transition-colors hover:bg-[#14326B]"
              >
                Reset filters
              </motion.button>
            )}
          </motion.li>
        ) : (
          filteredItems.map((item) => {
            const sessionStatus =
              liveConfig.liveEnabled !== false
                ? getSessionStatus(item, effectiveClockMs, conference, liveConfig)
                : 'upcoming';
            const isLive = sessionStatus === 'live';
            const isEnded = sessionStatus === 'ended';

            /* ── 1. Opening Ceremony (Centered VIP Gala Invitation Design) ── */
            if (item.type === 'special' && item.specialKind === 'ceremony') {
              const ceremonySubtitle = item.subtitle
                ? item.subtitle.replace(/\s*Hall/gi, '')
                : 'DDSC Organizing Board · Al Diwan & Princess';

              return (
                <motion.li
                  key={item.id}
                  variants={cardItemVariants}
                  className={`bg-gradient-to-br from-[#0B1B35] via-[#0F2544] to-[#0E6F64] rounded-2xl p-5 relative overflow-hidden border border-[#D4AF37]/30 shadow-[0_10px_28px_-8px_rgba(11,27,53,0.35)] transition-all ${
                    isLive
                      ? 'ring-2 ring-[#5EEAD4]'
                      : isEnded
                      ? 'opacity-60 hover:opacity-95 grayscale-[25%]'
                      : ''
                  }`}
                >
                  {/* Soft Radial Champagne-Gold Glow in Top-Right Corner */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#D4AF37]/10 blur-2xl"
                  />

                  <div className="flex flex-col items-center text-center relative z-10">
                    {/* Top Eyebrow Row */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F3D578] px-3 py-1 rounded-full font-display text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span>
                          SPECIAL EVENT · {formatTimeRange(item.startTime, item.endTime)}
                        </span>
                      </span>
                      {isLive && (
                        <span className="bg-white text-[#0E6F64] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0E6F64]" />
                          LIVE NOW
                        </span>
                      )}
                      {isEnded && (
                        <span className="bg-white/15 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                          <Check className="h-3 w-3" strokeWidth={2.5} />
                          Ended
                        </span>
                      )}
                    </div>

                    {/* Main Title */}
                    <h3 className="mt-2.5 inline-flex items-baseline justify-center gap-2.5">
                      <span className="font-script text-[34px] font-normal text-[#F3D578] leading-none">
                        Opening
                      </span>
                      <span className="font-display uppercase text-[15px] font-semibold tracking-[0.22em] text-slate-100/95">
                        Ceremony
                      </span>
                    </h3>

                    {/* Subtle Gold Divider */}
                    <div
                      aria-hidden="true"
                      className="w-10 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent my-2.5"
                    />

                    {/* Footer Details */}
                    <p className="text-xs text-slate-200/90 font-medium">
                      {ceremonySubtitle}
                    </p>
                  </div>
                </motion.li>
              );
            }

            /* ── 2. Breaks & Friday Prayer (Compact Centered Dashed-Border Divider Cards) ── */
            if (item.type === 'special') {
              const isPrayer = item.specialKind === 'prayer';
              const Icon = isPrayer ? Moon : Coffee;
              const containerClasses = isPrayer
                ? 'border-[#10B981]/40 bg-[#ECFDF5]/90 text-[#065F46]'
                : 'border-amber-400/55 bg-[#FFFBEB]/95 text-amber-950';
              const badgeClasses = isPrayer
                ? 'bg-[#10B981]/15 text-[#047857]'
                : 'bg-amber-500/15 text-amber-700';
              const subtitleClasses = isPrayer ? 'text-[#047857]/85' : 'text-amber-800/85';

              return (
                <motion.li
                  key={item.id}
                  variants={cardItemVariants}
                  className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-3 sm:px-5 sm:py-3.5 text-center transition-all ${containerClasses} ${
                    isLive
                      ? 'ring-2 ring-[#0E6F64]'
                      : isEnded
                      ? 'opacity-60 hover:opacity-95 grayscale-[20%]'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${badgeClasses}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-display text-xs sm:text-[13px] font-bold tracking-tight">
                      {item.title}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-display text-[11px] font-semibold tabular-nums ${badgeClasses}`}
                    >
                      {formatCompactTimeRange(item.startTime, item.endTime)}
                    </span>
                    {isLive && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E6F64] px-2.5 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider text-white">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        LIVE NOW
                      </span>
                    )}
                    {isEnded && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-600/15 border border-slate-600/20 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                        Ended
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className={`mt-1 text-[11.5px] leading-snug ${subtitleClasses}`}>
                      {item.subtitle}
                    </p>
                  )}
                </motion.li>
              );
            }

            /* ── 3. Scientific Session Card (Pass / Conference Ticket Layout) ── */
            const isPrincess = item.hall === 'princess';
            const hall = conference.halls[item.hall];
            const saved = isSaved(item.id);
            const speaker = speakersById[item.speakerId];
            const shortHallName = (
              hall?.name || (isPrincess ? 'Princess' : 'Al Diwan')
            ).replace(/\s*Hall$/i, '');
            const isUpNext =
              liveConfig.liveEnabled !== false &&
              (effectiveLiveState.upNextPrincess?.id === item.id ||
                effectiveLiveState.upNextDiwan?.id === item.id);

            return (
              <motion.li key={item.id} variants={cardItemVariants}>
                <motion.article
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.995 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  onClick={() => onSelectSession(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectSession(item);
                    }
                  }}
                  className={`group bg-white rounded-2xl border overflow-hidden relative cursor-pointer transition-all duration-200 ${
                    isLive
                      ? 'border-[#0E6F64]/60 ring-2 ring-[#0E6F64] shadow-[0_10px_28px_-8px_rgba(14,111,100,0.3)]'
                      : isEnded
                      ? 'border-slate-200/80 opacity-60 hover:opacity-95 grayscale-[25%] shadow-xs'
                      : 'border-slate-200/80 shadow-[0_6px_18px_-6px_rgba(15,37,68,0.09)] hover:border-[#3AB498]/45 hover:shadow-cardHover'
                  }`}
                >
                  {/* 1. Top Ticket Header Bar (Single-Line Time + Short Hall Name) */}
                  <div
                    className={`px-4 py-2 flex items-center justify-between gap-2 text-white transition-colors ${
                      isEnded
                        ? 'bg-slate-500'
                        : isPrincess
                        ? 'bg-[#0F2544]'
                        : 'bg-[#0E6F64]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide tabular-nums whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5 shrink-0 opacity-90" />
                      <span>{formatTimeRange(item.startTime, item.endTime)}</span>
                    </span>

                    <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
                      {shortHallName}
                    </span>
                  </div>

                  {/* 2. Main Lecture Body */}
                  <div className="px-4 pt-3 pb-2.5">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.specialty && (
                          <span
                            className="rounded-full px-2.5 py-0.5 font-display text-[11px] font-semibold"
                            style={specialtyPillStyle(item.specialty)}
                          >
                            {item.specialty}
                          </span>
                        )}
                        {isLive && (
                          <span className="bg-[#0E6F64]/15 text-[#0E6F64] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0E6F64] opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0E6F64]" />
                            </span>
                            LIVE
                          </span>
                        )}
                        {isEnded && (
                          <span className="bg-slate-200/80 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 whitespace-nowrap">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            ENDED
                          </span>
                        )}
                        {item.isShifted && item.delayMinutes > 0 && (
                          <span className="inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-display text-[10px] sm:text-[11px] font-semibold text-amber-700">
                            Adjusted +{item.delayMinutes}m
                          </span>
                        )}
                        {!isLive && !isEnded && isUpNext && (
                          <span className="inline-flex items-center rounded-full bg-[#0E6F64]/10 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-[#0E6F64]">
                            Up Next
                          </span>
                        )}
                      </div>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(item.id);
                        }}
                        aria-label={saved ? 'Remove from saved sessions' : 'Save session'}
                        aria-pressed={saved}
                        className={`-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                          saved
                            ? isPrincess
                              ? 'bg-[#0F2544]/10 text-[#0F2544]'
                              : 'bg-[#0E6F64]/10 text-[#0E6F64]'
                            : 'text-[#94A3B8] hover:bg-[#F4F7F9] hover:text-[#0F2544]'
                        }`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={saved ? 'on' : 'off'}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.14 }}
                            className="flex"
                          >
                            <Bookmark
                              className="h-[17px] w-[17px]"
                              fill={saved ? 'currentColor' : 'none'}
                            />
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </div>

                    <h3 className="font-display text-[15px] font-bold text-[#0F2544] leading-snug text-pretty">
                      {item.title}
                    </h3>
                  </div>

                  {/* 3. Ticket Perforation Divider with Semicircular Edge Cutout Notches */}
                  <div
                    className="border-t border-dashed border-slate-200 relative"
                    aria-hidden="true"
                  >
                    <span className="pointer-events-none absolute -left-2 -top-[7px] w-3.5 h-3.5 rounded-full bg-[#F3F6FA] border border-slate-200/80" />
                    <span className="pointer-events-none absolute -right-2 -top-[7px] w-3.5 h-3.5 rounded-full bg-[#F3F6FA] border border-slate-200/80" />
                  </div>

                  {/* 4. Compact Speaker Photo Stub Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/60 flex items-center gap-3">
                    <TicketSpeakerAvatar
                      speaker={speaker}
                      speakerName={item.speakerName}
                      isPrincess={isPrincess}
                    />
                    <p className="text-[13.5px] font-semibold text-slate-800 leading-tight">
                      {item.speakerName}
                    </p>
                  </div>
                </motion.article>
              </motion.li>
            );
          })
        )}
      </motion.ol>

      {posters && posters.length > 0 && <PostersShowcase posters={posters} />}

      {/* Official Schedule Posters Lightbox Modal */}
      <SchedulePostersModal
        isOpen={postersModalOpen}
        initialDay={selectedDay}
        initialHall={hallFilter}
        onClose={() => setPostersModalOpen(false)}
      />
    </div>
  );
}
