import { useState, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Bookmark,
  Coffee,
  Sparkles,
  Utensils,
  Moon,
  ClipboardCheck,
  BookmarkCheck,
  ChevronDown,
  Mic,
} from 'lucide-react';
import { LiveBanner } from './LiveBanner';
import { PostersShowcase } from './PostersShowcase';
import { SectionHeading } from './SectionHeading';
import { formatTime12h } from '../utils/time';
import { specialtyPillStyle, getSpecialtyColor } from '../utils/specialty';
import { staggerListVariants, cardItemVariants, EASE_OUT } from '../utils/motion';

const PILL_SPRING = { type: 'spring', stiffness: 460, damping: 36 };

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

function TimeBlock({ item, tone = 'default' }) {
  const start = splitTime(item.startTime);
  const end = formatTime12h(item.endTime);
  const mins = durationMinutes(item);
  const isSpecial = tone === 'special';
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-baseline gap-1">
        <span
          className={`font-display text-[17px] sm:text-xl font-extrabold leading-none tracking-tight tabular-nums ${
            isSpecial ? 'text-[#086958]' : 'text-[#0D224C]'
          }`}
        >
          {start.clock}
        </span>
        <span className="font-display text-[10px] font-bold uppercase text-[#64748B]">
          {start.period}
        </span>
      </div>
      <span className="mt-1.5 whitespace-nowrap text-[11px] font-medium leading-tight text-[#64748B] tabular-nums">
        to {end}
      </span>
      <span className="mt-1 hidden sm:inline-flex rounded-md bg-[#0D224C]/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B]">
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

  const dayItems = useMemo(
    () => schedule.filter((item) => item.day === selectedDay),
    [schedule, selectedDay]
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
      <LiveBanner
        liveState={liveState}
        nowMs={nowMs}
        previewPresetId={previewPresetId}
        onTogglePreview={onTogglePreview}
        onSelectPreset={onSelectPreset}
        onSelectSession={onSelectSession}
        conference={conference}
      />

      <SectionHeading
        eyebrow="Scientific Programme"
        title="Conference Agenda"
        description={`${activeDay?.fullLabel} · ${sessionCount} accredited lectures across two parallel halls. Times shown in Cairo (GMT+2).`}
      />

      {/* Compact Sticky Glass Filter Bar */}
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

          {/* 2. Unified Slim Filter Strip (Halls + Specialty Toggle) */}
          <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {hallOptions.map((opt) => {
              const active = hallFilter === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setHallFilter(opt.id)}
                  aria-pressed={active}
                  className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11.5px] font-semibold transition-colors duration-200 ${
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

            <span className="h-4 w-px shrink-0 bg-slate-200/80" aria-hidden="true" />

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
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[11.5px] font-semibold transition-colors duration-200 ${
                specialtyFilter !== 'all'
                  ? 'bg-[#3AB498]/15 text-[#086958] ring-1 ring-[#3AB498]/40'
                  : showSpecialties
                  ? 'bg-[#0D224C]/[0.07] text-[#0D224C]'
                  : 'text-[#64748B] hover:text-[#0D224C]'
              }`}
            >
              {specialtyFilter !== 'all' && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: getSpecialtyColor(specialtyFilter) }}
                />
              )}
              <span>{specialtyFilter !== 'all' ? specialtyFilter : 'Specialty'}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  showSpecialties ? 'rotate-180' : ''
                }`}
              />
            </motion.button>
          </div>

          {/* 3. Expandable Specialty Pills Row */}
          <AnimatePresence initial={false}>
            {showSpecialties && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <div className="mt-1 border-t border-slate-200/70 pt-1.5">
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
        className="space-y-3"
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
            const isLive = liveState.liveIds?.has(item.id);

            /* ── Break / ceremony / prayer rows ── */
            if (item.type === 'special') {
              const Icon = getSpecialIcon(item.specialKind);
              return (
                <motion.li
                  key={item.id}
                  variants={cardItemVariants}
                  className={`grid grid-cols-[84px_1fr] sm:grid-cols-[100px_1fr] items-center gap-3 sm:gap-5 rounded-2xl px-4 py-3.5 sm:px-5 ${
                    isLive
                      ? 'bg-[#3AB498]/20 ring-1 ring-[#3AB498]/45'
                      : 'bg-[#3AB498]/10 ring-1 ring-[#3AB498]/20'
                  }`}
                >
                  <TimeBlock item={item} tone="special" />
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#086958] shadow-xs">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-sm font-bold leading-snug tracking-tight text-[#0D224C]">
                          {item.title}
                        </h3>
                        {isLive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#086958] px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-white">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3AB498]" />
                            Now
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            }

            /* ── Scientific session card ── */
            const isPrincess = item.hall === 'princess';
            const hall = conference.halls[item.hall];
            const saved = isSaved(item.id);
            const speaker = speakersById[item.speakerId];

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
                  className={`group relative grid cursor-pointer grid-cols-[84px_1fr] sm:grid-cols-[100px_1fr] gap-3 sm:gap-5 overflow-hidden rounded-2xl border bg-white px-4 py-4 sm:px-5 sm:py-5 transition-[border-color,box-shadow] duration-200 ${
                    isLive
                      ? 'border-[#3AB498]/60 shadow-cardHover ring-1 ring-[#3AB498]/25'
                      : 'border-slate-200/90 shadow-[0_2px_10px_rgba(13,34,76,0.04)] hover:border-[#3AB498]/45 hover:shadow-cardHover'
                  }`}
                >
                  {/* Subtle architectural dot-grid micro-pattern */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: 'radial-gradient(#0D224C 1px, transparent 1px)',
                      backgroundSize: '14px 14px',
                    }}
                  />

                  {/* Hall accent bar */}
                  <span
                    className="absolute inset-y-0 left-0 z-10 w-1"
                    style={{ backgroundColor: hall?.accent }}
                    aria-hidden="true"
                  />

                  {/* Time column */}
                  <div className="relative z-10 border-r border-dashed border-[#0D224C]/10 pr-2 sm:pr-4">
                    <TimeBlock item={item} />
                  </div>

                  {/* Content column */}
                  <div className="relative z-10 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F7F9] px-2 py-0.5 font-display text-[10px] sm:text-[11px] font-semibold text-[#0B192C]">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: hall?.accent }}
                          />
                          {isPrincess ? 'Princess Hall' : 'Al Diwan Hall'}
                        </span>
                        {item.specialty && (
                          <span
                            className="rounded-full px-2 py-0.5 font-display text-[10px] sm:text-[11px] font-semibold"
                            style={specialtyPillStyle(item.specialty)}
                          >
                            {item.specialty}
                          </span>
                        )}
                        {isLive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#3AB498]/20 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-[#086958]">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3AB498] opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3AB498]" />
                            </span>
                            Live
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
                        className={`-mr-1.5 -mt-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                          saved
                            ? 'bg-[#3AB498]/15 text-[#086958]'
                            : 'text-[#94A3B8] hover:bg-[#F4F7F9] hover:text-[#0D224C]'
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
                              className="h-[18px] w-[18px]"
                              fill={saved ? 'currentColor' : 'none'}
                            />
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </div>

                    <h3 className="mt-2.5 font-display text-[15px] sm:text-[17px] font-bold leading-snug tracking-tight text-[#0B192C] text-pretty transition-colors group-hover:text-[#0D224C]">
                      {item.title}
                    </h3>

                    {/* Clean Vertically Centered Speaker Row */}
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#3AB498]/10 flex items-center justify-center shrink-0">
                        <Mic className="h-[15px] w-[15px] text-[#086958]" />
                      </div>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-[13px] sm:text-sm font-semibold text-[#0B192C]">
                          {item.speakerName}
                        </p>
                        {speaker?.title && (
                          <p className="mt-0.5 truncate text-[11px] sm:text-xs text-[#64748B]">
                            {speaker.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              </motion.li>
            );
          })
        )}
      </motion.ol>

      {posters && posters.length > 0 && <PostersShowcase posters={posters} />}
    </div>
  );
}
