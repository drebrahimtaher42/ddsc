import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, EyeOff, ChevronDown, Sparkles, Radio, MapPin } from 'lucide-react';
import logoWhite from '../assets/logo-white.svg';
import {
  PREVIEW_PRESETS,
  formatTime12h,
  formatCompactTimeRange,
  formatCairoClock,
  getMinutesRemaining,
} from '../utils/time';
import { EASE_OUT } from '../utils/motion';

function HallUpNextRow({ upNextSession, withTopDivider = true }) {
  const [expanded, setExpanded] = useState(false);

  if (!upNextSession) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setExpanded((prev) => !prev);
      }}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          setExpanded((prev) => !prev);
        }
      }}
      className={`${
        withTopDivider ? 'border-t border-white/10 mt-3 pt-2.5' : ''
      } cursor-pointer select-none group/upnext text-left`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[#5EEAD4]">
          UP NEXT · {formatTime12h(upNextSession.startTime)}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#5EEAD4]/80 transition-transform duration-200 group-hover/upnext:text-white ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </div>
      <p
        className={`mt-1 text-xs leading-snug text-white/80 transition-all duration-200 ${
          expanded ? 'whitespace-normal' : 'truncate'
        }`}
      >
        <span className="font-bold text-white">{upNextSession.speakerName}</span>
        <span className="mx-1.5 text-white/45">—</span>
        <span className="text-white/75">{upNextSession.title}</span>
      </p>
    </div>
  );
}

function LiveHallSlot({
  label,
  accentDot,
  session,
  upNextSession,
  nowMs,
  onSelectSession,
}) {
  return (
    <motion.div
      whileHover={session ? { y: -2 } : undefined}
      className="flex flex-col justify-between rounded-xl border border-white/15 bg-white/[0.09] backdrop-blur-sm p-3.5 transition-colors duration-200 hover:bg-white/[0.13] hover:border-white/25"
    >
      <div
        onClick={() => session && onSelectSession(session)}
        role={session ? 'button' : undefined}
        tabIndex={session ? 0 : undefined}
        onKeyDown={(e) => {
          if (session && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onSelectSession(session);
          }
        }}
        className={session ? 'cursor-pointer' : 'opacity-80'}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-white/85">
            <span className={`h-2 w-2 rounded-full ${accentDot}`} />
            {label}
          </span>
          {session && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#3AB498]/25 px-2 py-0.5 font-display text-[10px] font-semibold text-[#A7F3E2]">
              {getMinutesRemaining(session.endIso, nowMs)}m left
            </span>
          )}
        </div>

        {session ? (
          <>
            <h3 className="font-display text-sm font-bold leading-snug text-white line-clamp-2">
              {session.title}
            </h3>
            <div className="mt-1.5 flex items-center justify-between gap-1.5 text-xs text-white/80">
              <span className="min-w-0 truncate font-medium text-white/95">
                {session.speakerName}
              </span>
              <span className="text-[11px] shrink-0 whitespace-nowrap text-white/65 tabular-nums">
                {formatCompactTimeRange(session.startTime, session.endTime)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-xs text-white/65 py-2">No active lecture right now</p>
        )}
      </div>

      <HallUpNextRow upNextSession={upNextSession} withTopDivider />
    </motion.div>
  );
}

export function LiveBanner({
  liveState,
  nowMs,
  previewPresetId,
  onTogglePreview,
  onSelectPreset,
  onSelectSession,
  conference,
}) {
  const isPreview = Boolean(previewPresetId);
  const {
    phase,
    countdown,
    livePrincess,
    liveDiwan,
    liveSpecial,
    upNextPrincess,
    upNextDiwan,
  } = liveState;
  const showLiveContent = isPreview || phase === 'live' || phase === 'between';
  const modeKey = showLiveContent
    ? `live-${previewPresetId || phase}`
    : `state-${phase}`;

  return (
    <section
      aria-label="Conference Live Status"
      className="relative overflow-hidden rounded-2xl bg-brand-gradient p-4 sm:p-5 text-white shadow-card"
    >
      {/* Ambient GPU-composited Glow & Shimmer */}
      <motion.div
        aria-hidden="true"
        animate={{
          x: [0, 32, -16, 0],
          y: [0, -14, 12, 0],
          opacity: [0.28, 0.5, 0.32, 0.28],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -top-16 right-8 h-48 w-48 rounded-full bg-[#3AB498]/35 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: ['-100%', '220%'] }}
        transition={{
          duration: 7.5,
          repeat: Infinity,
          repeatDelay: 4.5,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
      />

      {/* Subtle White SVG Brand Watermark */}
      <img
        src={logoWhite}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-4 -bottom-6 h-44 w-auto opacity-[0.06]"
      />

      <div className="relative z-10">
        {/* Unified Single-Row Top Bar: Status + Compact Live Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AB498] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3AB498]" />
            </span>
            <span className="truncate font-display text-[11px] font-bold uppercase tracking-widest text-[#8CE9D2]">
              {isPreview
                ? 'Live Mode Preview'
                : phase === 'live'
                ? 'Happening Now'
                : phase === 'before'
                ? 'Countdown to DDSC 2026'
                : phase === 'between'
                ? 'Conference In Progress'
                : 'DDSC 2026 Concluded'}
            </span>
            {showLiveContent && (
              <span className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
                <Clock className="h-3 w-3 text-[#3AB498]" />
                {formatCairoClock(nowMs)} Cairo
              </span>
            )}
          </div>

          {(phase === 'before' || phase === 'after' || isPreview) && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onTogglePreview}
              aria-label={isPreview ? 'Exit Live Preview' : 'Preview Live Mode'}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[11px] font-semibold transition-colors ${
                isPreview
                  ? 'bg-white text-[#0D224C] hover:bg-white/90'
                  : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
              }`}
            >
              {isPreview ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  <span>Exit</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 text-[#3AB498]" />
                  <span>Live</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Organizer Preview Time Switcher */}
        <AnimatePresence initial={false}>
          {isPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {PREVIEW_PRESETS.map((preset) => {
                  const active = previewPresetId === preset.id;
                  return (
                    <motion.button
                      key={preset.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => onSelectPreset(preset.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? 'bg-[#3AB498] text-[#0B192C] font-semibold'
                          : 'bg-white/10 text-white/75 hover:bg-white/15 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Content Mode Swap */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={modeKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            {/* STATE 1: Pre-Conference Countdown */}
            {!showLiveContent && phase === 'before' && (
              <div className="mt-4">
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white">
                  {conference.fullName}
                </h1>
                {conference.tagline && (
                  <p className="mt-1 font-display text-xs sm:text-[13px] font-semibold text-[#8CE9D2]">
                    {conference.tagline}
                  </p>
                )}

                <div className="mt-2.5 space-y-1 text-xs sm:text-sm text-slate-200/90">
                  <p>Opening Ceremony · Thu, 26 Nov at 9:30 AM</p>
                  <p className="inline-flex items-center gap-1.5 font-medium text-white/90">
                    <MapPin className="h-[13px] w-[13px] shrink-0 text-[#3AB498]" />
                    <span>{conference.venue.name}</span>
                  </p>
                </div>

                <div
                  className="mt-5 grid grid-cols-4 gap-2 sm:gap-3"
                  aria-label="Countdown timer"
                >
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hrs', value: countdown.hours },
                    { label: 'Min', value: countdown.minutes },
                    { label: 'Sec', value: countdown.seconds },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="flex flex-col items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-2 py-2.5"
                    >
                      <span className="font-display text-lg sm:text-xl font-bold tabular-nums leading-none text-white">
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-white/70">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATE 2: Live Mode */}
            {showLiveContent && (
              <div className="mt-3.5 space-y-3">
                {liveSpecial ? (
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-4">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-[#8CE9D2]">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          All Halls · {formatCompactTimeRange(liveSpecial.startTime, liveSpecial.endTime)}
                        </span>
                        <span className="shrink-0 whitespace-nowrap rounded-full bg-[#3AB498]/25 px-2.5 py-0.5 font-display text-[10px] font-semibold text-[#A7F3E2]">
                          {getMinutesRemaining(liveSpecial.endIso, nowMs)}m left
                        </span>
                      </div>
                      <h2 className="font-display text-base font-bold text-white">
                        {liveSpecial.title}
                      </h2>
                      {liveSpecial.subtitle && (
                        <p className="mt-1 text-xs text-white/75">{liveSpecial.subtitle}</p>
                      )}
                    </div>

                    {(upNextPrincess || upNextDiwan) && (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {upNextPrincess && (
                          <div className="rounded-xl border border-white/15 bg-white/[0.09] backdrop-blur-sm p-3.5">
                            <span className="inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-white/85 mb-2">
                              <span className="h-2 w-2 rounded-full bg-white" />
                              Princess Hall
                            </span>
                            <HallUpNextRow
                              upNextSession={upNextPrincess}
                              withTopDivider={false}
                            />
                          </div>
                        )}
                        {upNextDiwan && (
                          <div className="rounded-xl border border-white/15 bg-white/[0.09] backdrop-blur-sm p-3.5">
                            <span className="inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-white/85 mb-2">
                              <span className="h-2 w-2 rounded-full bg-[#3AB498]" />
                              Al Diwan Hall
                            </span>
                            <HallUpNextRow
                              upNextSession={upNextDiwan}
                              withTopDivider={false}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : livePrincess || liveDiwan || upNextPrincess || upNextDiwan ? (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <LiveHallSlot
                      label="Princess Hall"
                      accentDot="bg-white"
                      session={livePrincess}
                      upNextSession={upNextPrincess}
                      nowMs={nowMs}
                      onSelectSession={onSelectSession}
                    />
                    <LiveHallSlot
                      label="Al Diwan Hall"
                      accentDot="bg-[#3AB498]"
                      session={liveDiwan}
                      upNextSession={upNextDiwan}
                      nowMs={nowMs}
                      onSelectSession={onSelectSession}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-3.5 flex items-center gap-3">
                    <Radio className="h-5 w-5 text-[#3AB498] shrink-0" />
                    <div>
                      <p className="font-display text-sm font-semibold text-white">
                        Between Scientific Sessions
                      </p>
                      <p className="text-xs text-white/75">
                        Explore the exhibition foyer or prepare for the next lectures below.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STATE 3: Post-Conference */}
            {!showLiveContent && phase === 'after' && (
              <div className="mt-3.5 flex items-center gap-3">
                <img src={logoWhite} alt="DDSC" className="h-9 w-auto opacity-95" />
                <div>
                  <h1 className="font-display text-base sm:text-lg font-bold text-white">
                    Thank you for joining DDSC 2026
                  </h1>
                  <p className="text-xs text-white/75">
                    The 29th Damietta Dental Syndicate Conference has concluded. Browse the full archive below.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
