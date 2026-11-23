import { useState, useMemo, useEffect } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronRight, Mic, CheckCircle2, X, Info } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { formatTime12h } from '../utils/time';
import { getSpecialtyColor } from '../utils/specialty';
import { staggerListVariants, cardItemVariants, lightboxZoomVariants, EASE_OUT } from '../utils/motion';

const PILL_SPRING = { type: 'spring', stiffness: 460, damping: 36 };

function formatSpeakerDisplayName(name) {
  return String(name || '').replace(/^IDCE Team led by\s+/i, '');
}

function getSpeakerCredentialsSummary(speaker) {
  if (Array.isArray(speaker?.credentials) && speaker.credentials.length > 0) {
    return speaker.credentials.slice(0, 2).join(' · ');
  }
  if (speaker?.bio) return speaker.bio;
  if (speaker?.specialty) return `${speaker.specialty} Faculty & Keynote Speaker`;
  return speaker?.title || '';
}

function SpeakerPortrait({ src, name, initials, avatarTone = 'navy' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImg = Boolean(src) && !failed;
  const fallbackGradient =
    avatarTone === 'emerald'
      ? 'bg-gradient-to-br from-[#086958] to-[#3AB498]'
      : 'bg-gradient-to-br from-[#0D224C] to-[#1D3E78]';

  return (
    <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs bg-slate-100">
      {showImg ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-display text-base font-bold text-white ${fallbackGradient}`}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export function SpeakersView({
  speakers,
  scheduleById,
  conference,
  onSelectSpeaker,
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [activePosterSpeaker, setActivePosterSpeaker] = useState(null);

  useEffect(() => {
    if (!activePosterSpeaker) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActivePosterSpeaker(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePosterSpeaker]);

  const handleCardActivate = (speaker) => {
    if (speaker?.poster) {
      setActivePosterSpeaker(speaker);
    } else {
      onSelectSpeaker(speaker);
    }
  };

  const specialties = useMemo(
    () => ['All', ...new Set(speakers.map((s) => s.specialty).filter(Boolean))],
    [speakers]
  );

  const filteredSpeakers = useMemo(() => {
    const list =
      selectedSpecialty === 'All'
        ? speakers
        : speakers.filter((s) => s.specialty === selectedSpecialty);
    return [
      ...list.filter((s) => /elsharabasy/i.test(s.name)),
      ...list.filter((s) => !/elsharabasy/i.test(s.name)),
    ];
  }, [speakers, selectedSpecialty]);

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow="Scientific Faculty"
        title="Distinguished Speakers"
        description={`${speakers.length} keynote & specialty lecturers across ${specialties.length - 1} dental disciplines.`}
        aside={
          <span className="inline-flex rounded-full border border-slate-200/70 bg-white px-3.5 py-1.5 font-display text-xs font-semibold text-[#086958] shadow-xs tabular-nums">
            {filteredSpeakers.length}{' '}
            {filteredSpeakers.length === 1 ? 'Speaker' : 'Speakers'}
          </span>
        }
      />

      {/* Horizontal Scrollable Glass Specialty Filter Bar */}
      <LayoutGroup id="speaker-specialties">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-xs backdrop-blur-md">
          {specialties.map((specialty) => {
            const active = selectedSpecialty === specialty;
            return (
              <motion.button
                key={specialty}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="speakerSpecialtyPill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-[#0D224C] shadow-sm"
                    aria-hidden="true"
                  />
                )}
                {specialty !== 'All' && (
                  <span
                    className="relative z-10 h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: active ? '#3AB498' : getSpecialtyColor(specialty),
                    }}
                  />
                )}
                <span className="relative z-10">{specialty}</span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Responsive Staggered Speaker Grid */}
      <motion.div
        key={selectedSpecialty}
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredSpeakers.map((speaker) => {
          const session = scheduleById[speaker.sessionId];
          const dayInfo = conference.days.find((d) => d.id === session?.day);
          const isPrincess = session?.hall === 'princess';
          const displayName = formatSpeakerDisplayName(speaker.name);
          const credentialsSummary = getSpeakerCredentialsSummary(speaker);

          return (
            <motion.article
              key={speaker.id}
              variants={cardItemVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onClick={() => handleCardActivate(speaker)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardActivate(speaker);
                }
              }}
              className="group bg-white rounded-2xl border border-slate-200/85 shadow-[0_6px_18px_-6px_rgba(15,37,68,0.08)] overflow-hidden flex flex-col justify-between cursor-pointer transition-[border-color,box-shadow] duration-200 hover:border-[#0E6F64]/40 hover:shadow-cardHover"
            >
              <div>
                {/* 3px Top Hall Accent Bar */}
                <div
                  className={`h-[3px] w-full ${
                    isPrincess ? 'bg-[#0F2544]' : 'bg-[#0E6F64]'
                  }`}
                  aria-hidden="true"
                />

                {/* Main Speaker Profile Body */}
                <div className="p-4 flex items-start gap-3.5">
                  <SpeakerPortrait
                    src={speaker.avatar || speaker.photo}
                    name={displayName}
                    initials={speaker.initials}
                    avatarTone={speaker.avatarTone}
                  />

                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-[#0E6F64]/10 px-2.5 py-0.5 font-display text-[11px] font-semibold text-[#0E6F64]">
                      {speaker.specialty}
                    </span>
                    <h2 className="mt-1 font-display text-[15.5px] font-extrabold text-[#0F2544] leading-snug">
                      {displayName}
                    </h2>
                    {credentialsSummary && (
                      <p className="text-[12.5px] text-slate-600 leading-snug mt-1 line-clamp-2">
                        {credentialsSummary}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Compact Footer Strip */}
              {session && (
                <div className="px-4 py-2.5 bg-slate-50/75 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mic className="h-3.5 w-3.5 shrink-0 text-[#0E6F64]" />
                    <p className="text-[11.5px] font-medium text-slate-500 truncate">
                      {session.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0F2544]">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {dayInfo?.shortLabel}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {formatTime12h(session.startTime)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            isPrincess ? 'bg-[#0F2544]' : 'bg-[#0E6F64]'
                          }`}
                        />
                        {isPrincess ? 'Princess' : 'Al Diwan'}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0E6F64]" />
                  </div>
                </div>
              )}
            </motion.article>
          );
        })}
      </motion.div>

      {/* Full Original Poster Modal */}
      <AnimatePresence>
        {activePosterSpeaker && (
          <motion.div
            key="speaker-poster-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#061024]/90 backdrop-blur-md p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`${activePosterSpeaker.name} lecture poster`}
            onClick={() => setActivePosterSpeaker(null)}
          >
            {/* Top Close Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setActivePosterSpeaker(null)}
              className="fixed right-4 top-4 sm:right-6 sm:top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              aria-label="Close poster"
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Full Poster Image */}
            <motion.div
              key={activePosterSpeaker.id}
              variants={lightboxZoomVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center max-w-lg w-full"
            >
              <img
                src={activePosterSpeaker.poster}
                alt={`${activePosterSpeaker.name} lecture poster`}
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl border border-white/15 shadow-2xl bg-[#0B192C]"
              />

              {/* Compact Frosted Footer Bar with Full Bulleted Credentials */}
              <div className="mt-3 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-white">
                      {formatSpeakerDisplayName(activePosterSpeaker.name)}
                    </p>
                    <p className="truncate text-xs text-slate-300">
                      {activePosterSpeaker.specialty}
                      {scheduleById[activePosterSpeaker.sessionId]
                        ? ` · ${formatTime12h(scheduleById[activePosterSpeaker.sessionId].startTime)}`
                        : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const target = activePosterSpeaker;
                      setActivePosterSpeaker(null);
                      onSelectSpeaker(target);
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#3AB498] px-3 py-1.5 font-display text-xs font-semibold text-[#061024] transition-colors hover:bg-[#5EEAD4]"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Session Details</span>
                  </button>
                </div>

                {Array.isArray(activePosterSpeaker.credentials) &&
                  activePosterSpeaker.credentials.length > 0 && (
                    <ul className="mt-2.5 border-t border-white/10 pt-2 space-y-1">
                      {activePosterSpeaker.credentials.map((cred) => (
                        <li
                          key={cred}
                          className="flex items-start gap-2 text-xs leading-snug text-slate-200"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5EEAD4]" />
                          <span>{cred}</span>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
