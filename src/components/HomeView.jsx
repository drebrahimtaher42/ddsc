import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Expand,
  Calendar,
  Phone,
  Gift,
  Award,
} from 'lucide-react';
import lecturePosters from 'virtual:lecture-posters';
import boardMembers from '../data/board.json';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Carousel } from './Carousel';
import { SectionHeading } from './SectionHeading';
import { buildWhatsAppUrl, formatTime12h } from '../utils/time';
import { specialtyPillStyle } from '../utils/specialty';
import {
  staggerListVariants,
  cardItemVariants,
  lightboxZoomVariants,
  EASE_OUT,
} from '../utils/motion';

const BUNDLE_SUMMARY = [
  { count: '2 Workshops', perk: 'Free Conference Ticket OR 50% OFF the 3rd' },
  { count: '3 Workshops', perk: '4th Workshop FREE' },
  { count: '4 Workshops', perk: '5th Workshop + Conference Ticket FREE' },
];

function BoardMemberCard({ member }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [member.photo]);

  const showImage = Boolean(member.photo) && !imgFailed;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
      className="rounded-2xl bg-white border border-slate-200/70 shadow-sm p-4 text-center transition-all hover:border-[#3AB498]/50 hover:shadow-md"
    >
      <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl overflow-hidden ring-2 ring-[#3AB498]/25 mb-3 bg-[#F4F7F9]">
        {showImage ? (
          <img
            src={member.photo}
            alt={member.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient font-display text-lg font-bold text-white">
            {member.initials}
          </div>
        )}
      </div>

      <h3 className="font-display text-[13px] sm:text-sm font-bold leading-snug tracking-tight text-[#0D224C]">
        {member.name}
      </h3>
      <p className="mt-1 font-display text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-snug text-[#086958]">
        {member.role}
      </p>
    </motion.article>
  );
}

function WorkshopSlidePoster({ workshop }) {
  const candidates = workshop.poster
    ? [
        workshop.poster,
        workshop.poster.endsWith('.jpg') ? `${workshop.poster}.jpg` : null,
        workshop.poster.endsWith('.jpg') ? `${workshop.poster}.jpeg` : null,
      ].filter(Boolean)
    : [];
  const [srcIdx, setSrcIdx] = useState(0);

  useEffect(() => {
    setSrcIdx(0);
  }, [workshop.poster]);

  const activeSrc = candidates[srcIdx] || null;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-gradient">
      {activeSrc ? (
        <img
          src={activeSrc}
          alt={workshop.title}
          loading="lazy"
          draggable={false}
          onError={() => setSrcIdx((i) => i + 1)}
          className="w-full h-full object-cover scale-100"
        />
      ) : (
        <div className="relative flex h-full w-full flex-col justify-between p-4 text-white">
          <img
            src={logoWhite}
            alt="DDSC"
            className="h-8 w-auto opacity-95"
          />
          <div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#8CE9D2]">
              {workshop.date}
            </p>
            <h4 className="mt-0.5 font-display text-sm font-bold leading-snug text-white line-clamp-2">
              {workshop.title}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
}

const pad2 = (n) => String(n).padStart(2, '0');

function LiveRow({ hall, session }) {
  if (!session) return null;
  return (
    <p className="mt-1.5 text-left text-[12.5px] leading-snug text-white/85 truncate">
      <span className="font-semibold text-[#5EEAD4]">{hall}:</span>{' '}
      <span className="text-white">{session.title}</span>
    </p>
  );
}

/**
 * Hero status card driven by the shared liveState (ticks every second in App):
 * before → countdown to opening · live → what's on in each hall ·
 * between → next session · after → thank-you note. Never sits at 00:00:00.
 */
function HeroStatus({ liveState, onNavigate }) {
  if (!liveState) return null;
  const { phase, countdown } = liveState;
  const cardClass =
    'w-full max-w-[340px] rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-sm px-4 py-3';

  if (phase === 'before' && !countdown.isComplete) {
    const units = [
      ...(countdown.days > 0 ? [{ v: countdown.days, l: 'Days' }] : []),
      { v: countdown.hours, l: 'Hrs' },
      { v: countdown.minutes, l: 'Min' },
      { v: countdown.seconds, l: 'Sec' },
    ];
    return (
      <div className={cardClass} role="timer" aria-live="off">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5EEAD4]/90">
          Opening ceremony starts in
        </p>
        <div
          className={`mt-2 grid divide-x divide-white/10 ${units.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}
        >
          {units.map((u) => (
            <div key={u.l} className="flex flex-col items-center px-2">
              <span className="font-display text-[30px] font-extrabold tabular-nums leading-none tracking-tight text-white">
                {pad2(u.v)}
              </span>
              <span className="mt-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300/75">
                {u.l}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'after') {
    return (
      <div className={cardClass}>
        <p className="font-display text-sm font-bold text-white">
          Thank you for joining DDSC 2026
        </p>
        <p className="mt-1 text-[12.5px] text-slate-300/85">See you at the 30th edition.</p>
      </div>
    );
  }

  const { livePrincess, liveDiwan, liveSpecial, upNext } = liveState;
  const isLive = phase === 'live' || (phase === 'before' && countdown.isComplete);

  if (isLive) {
    return (
      <button
        type="button"
        onClick={() => onNavigate('schedule')}
        className={`${cardClass} text-left transition-colors hover:bg-white/[0.1]`}
      >
        <span className="inline-flex items-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          Live now
        </span>
        {liveSpecial ? (
          <p className="mt-1.5 text-[13px] font-semibold text-white truncate">{liveSpecial.title}</p>
        ) : (
          <>
            <LiveRow hall="Princess" session={livePrincess} />
            <LiveRow hall="Al Diwan" session={liveDiwan} />
          </>
        )}
        {!liveSpecial && !livePrincess && !liveDiwan && (
          <p className="mt-1.5 text-[12.5px] text-white/80">Opening ceremony</p>
        )}
      </button>
    );
  }

  // between sessions / between days
  const next = upNext?.[0];
  return (
    <button
      type="button"
      onClick={() => onNavigate('schedule')}
      className={`${cardClass} text-left transition-colors hover:bg-white/[0.1]`}
    >
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5EEAD4]/90">
        {next ? `Up next · ${formatTime12h(next.startTime)}` : 'Break'}
      </p>
      {next && (
        <p className="mt-1.5 text-[13px] font-semibold text-white truncate">{next.title}</p>
      )}
    </button>
  );
}

export function HomeView({
  conference,
  workshops,
  bookingUrl,
  supportUrl,
  onNavigate,
  onSelectWorkshop,
  liveState,
}) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const isLightboxOpen = lightboxIdx !== null;
  const activeLecturePoster = isLightboxOpen ? lecturePosters[lightboxIdx] : null;

  const handlePrevPoster = useCallback(() => {
    setLightboxIdx((prev) =>
      prev === null
        ? null
        : (prev - 1 + lecturePosters.length) % lecturePosters.length
    );
  }, []);

  const handleNextPoster = useCallback(() => {
    setLightboxIdx((prev) =>
      prev === null ? null : (prev + 1) % lecturePosters.length
    );
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') handlePrevPoster();
      if (e.key === 'ArrowRight') handleNextPoster();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLightboxOpen, handlePrevPoster, handleNextPoster]);

  const bundleClaimUrl = buildWhatsAppUrl(
    conference.whatsapp.number,
    conference.whatsapp.bundleMessage ||
      'Hello, I would like to book a DDSC 2026 Workshop Bundle'
  );

  const highlights = [
    {
      value: '27',
      suffix: '+',
      label: 'Scientific Lectures',
      target: 'schedule',
    },
    {
      value: String(workshops.length),
      suffix: '',
      label: 'Hands-On Workshops',
      target: 'workshops',
    },
    {
      value: '20',
      suffix: '+',
      label: 'Dental Exhibitors',
      target: 'exhibitors',
    },
  ];

  return (
    <div className="bg-[#F3F6FA]">
      {/* 1. HERO — identity first, live conference status, two clear actions */}
      <section className="w-full relative overflow-hidden bg-[#0B1B35] text-white min-h-[100svh] md:min-h-[85vh] flex flex-col justify-between">
        {/* Centered top radial spotlight glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,111,100,0.32)_0%,_transparent_68%)]"
        />

        {/* Slow-drifting ambient teal aurora glow */}
        <motion.div
          aria-hidden="true"
          animate={{
            x: [0, 26, -16, 0],
            y: [0, -14, 10, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[22rem] w-[30rem] rounded-full bg-[#0E6F64]/30 blur-3xl"
        />

        {/* Ultra-faint dot grid masked toward the edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage:
              'radial-gradient(ellipse at center, black 35%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 35%, transparent 80%)',
          }}
        />

        {/* Faint DDSC watermark — desktop only (on mobile it gets cut and sits under the text) */}
        <img
          src={logoWhite}
          alt=""
          aria-hidden="true"
          className="hidden md:block pointer-events-none select-none absolute right-[4%] top-1/2 -translate-y-1/2 h-[26rem] w-auto opacity-[0.035]"
        />

        <motion.div
          variants={staggerListVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-20 flex-1 flex flex-col justify-between text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center pb-8">
            {/* Edition badge — the strongest credential, up front */}
            <motion.span
              variants={cardItemVariants}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#5EEAD4]/25 bg-white/[0.06] px-3.5 py-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5EEAD4]"
            >
              <Award className="h-3.5 w-3.5" />
              29th Edition · Since 1995
            </motion.span>

            {/* Conference name as the headline */}
            <motion.h1
              variants={cardItemVariants}
              className="mt-4 font-display text-[clamp(2.75rem,13.5vw,5.5rem)] font-extrabold leading-none tracking-tight text-white"
            >
              DDSC <span className="text-[#5EEAD4]">2026</span>
            </motion.h1>

            <motion.p
              variants={cardItemVariants}
              className="mt-3 font-display text-[15px] sm:text-xl font-semibold text-slate-100 max-w-[320px] sm:max-w-lg text-balance"
            >
              Damietta Dental Syndicate Conference
            </motion.p>

            <motion.p
              variants={cardItemVariants}
              className="mt-2 text-[13.5px] sm:text-base text-slate-300/85 leading-relaxed max-w-[330px] sm:max-w-md text-balance"
            >
              {conference.tagline} — 27+ lectures, hands-on workshops & 20+ exhibitors.
            </motion.p>

            {/* Live status: countdown → live now → next up → thank you */}
            <motion.div variants={cardItemVariants} className="mt-5 w-full flex justify-center">
              <HeroStatus liveState={liveState} onNavigate={onNavigate} />
            </motion.div>

            {/* Actions */}
            <motion.div
              variants={cardItemVariants}
              className="mt-5 flex w-full max-w-[340px] gap-3"
            >
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('schedule')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#3AB498] to-[#2EA389] text-[#06201B] font-display text-sm font-bold shadow-[0_10px_28px_-6px_rgba(45,212,191,0.4)] hover:brightness-105 transition-all"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </motion.button>
              <motion.a
                href={conference.venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/20 bg-white/[0.06] text-white font-display text-sm font-bold hover:bg-white/[0.12] transition-all"
              >
                <MapPin className="h-4 w-4 text-[#5EEAD4]" />
                Directions
              </motion.a>
            </motion.div>
          </div>

          {/* Date & venue strip */}
          <motion.div
            variants={cardItemVariants}
            className="border-t border-white/10 pt-5 pb-28 md:pb-10 px-4 w-full"
          >
            <div className="grid grid-cols-2 divide-x divide-white/10 max-w-md mx-auto">
              <div className="px-3 flex flex-col items-center text-center">
                <span className="font-display text-[10px] uppercase tracking-[0.18em] text-[#5EEAD4]/80 font-semibold">
                  DATE
                </span>
                <span className="font-display text-[13.5px] font-semibold text-white mt-0.5 whitespace-nowrap">
                  26–27 Nov 2026
                </span>
                <span className="text-[12px] text-slate-300/80 font-medium mt-0.5 whitespace-nowrap">
                  Thu – Fri
                </span>
              </div>

              <div className="px-3 flex flex-col items-center text-center">
                <span className="font-display text-[10px] uppercase tracking-[0.18em] text-[#5EEAD4]/80 font-semibold">
                  VENUE
                </span>
                <span className="font-display text-[13.5px] font-semibold text-white mt-0.5 text-balance">
                  Steigenberger El Lessan
                </span>
                <span className="text-[12px] text-slate-300/80 font-medium mt-0.5 whitespace-nowrap">
                  Ras El Bar, Damietta
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. FULL-BLEED ARCHITECTURAL STATS BAND */}
      <section
        aria-label="Conference Highlights"
        className="w-full bg-white border-b border-slate-200/80 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3">
          {highlights.map((stat, idx) => {
            const layerClasses =
              idx === 0
                ? 'z-10'
                : idx === 1
                ? 'z-20 shadow-[-10px_0_20px_-10px_rgba(15,37,68,0.12)] border-l border-slate-100'
                : 'z-30 shadow-[-10px_0_20px_-10px_rgba(15,37,68,0.12)] border-l border-slate-100';

            return (
              <motion.button
                key={stat.label}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(stat.target)}
                className={`group relative bg-white py-6 sm:py-8 px-2 sm:px-6 flex flex-col items-center text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0E6F64]/40 ${layerClasses}`}
              >
                <span className="font-display text-[26px] sm:text-4xl font-extrabold tracking-tight text-[#0F2544] leading-none tabular-nums transition-colors group-hover:text-[#0E6F64]">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-[#0E6F64]">{stat.suffix}</span>
                  )}
                </span>
                <span className="text-[11px] sm:text-[12.5px] font-medium text-slate-500 leading-snug mt-2 text-balance max-w-[100px] sm:max-w-none">
                  {stat.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* BELOW-THE-FOLD EDITORIAL SECTIONS */}
      <motion.div
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl px-4 pt-8 pb-4 sm:px-6 space-y-8 sm:space-y-10"
      >

        {/* 3. SLIDE 1 — SCIENTIFIC SESSIONS CAROUSEL */}
        <motion.section
          variants={cardItemVariants}
          aria-label="Scientific Sessions"
          className="space-y-4"
        >
          <SectionHeading
            eyebrow="2026 Program"
            title="Scientific Sessions"
            description={`${lecturePosters.length} accredited keynote & specialty lectures across two halls.`}
            aside={
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0D224C] px-4 py-2 font-display text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#14326B]"
              >
                <span>View Full Timetable</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            }
          />

          <Carousel ariaLabel="Scientific Sessions" gapClass="gap-4">
            {({ activeIndex }) =>
              lecturePosters.map((poster, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={poster.id}
                    type="button"
                    onClick={() => setLightboxIdx(index)}
                    className={`group relative snap-center shrink-0 w-[80vw] sm:w-[310px] md:w-[330px] aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200/70 bg-[#0D224C] shadow-card hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-[#086958] transition-all duration-300 ${
                      isActive
                        ? 'scale-100 opacity-100 blur-0'
                        : 'scale-[0.94] opacity-75 blur-[1.5px]'
                    }`}
                    aria-label={`Inspect ${poster.label}`}
                  >
                    <img
                      src={poster.src}
                      alt={poster.label}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover scale-100"
                    />
                    <span
                      className="pointer-events-none absolute right-2.5 bottom-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md opacity-85 transition-all duration-200 group-hover:scale-110 group-hover:bg-[#3AB498] group-hover:text-[#0B192C]"
                      aria-hidden="true"
                    >
                      <Expand className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })
            }
          </Carousel>
        </motion.section>

        {/* 4. SLIDE 2 — HANDS-ON WORKSHOPS CAROUSEL */}
        <motion.section
          variants={cardItemVariants}
          aria-label="Hands-On Workshops"
          className="space-y-4"
        >
          <SectionHeading
            eyebrow="Practical Clinical Training"
            title="Hands-On Workshops"
            description={`${workshops.length} limited-seat pre-conference labs (20–25 Nov) built around real chairside protocols you can apply immediately.`}
            aside={
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('workshops')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#086958] px-4 py-2 font-display text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#065749]"
              >
                <span>View All Workshops</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            }
          />

          {/* Compact Workshop Bundle Offers Summary */}
          <div className="rounded-2xl bg-brand-gradient p-4 sm:p-5 text-white shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 shrink-0 text-[#3AB498]" />
                <span className="font-display text-xs sm:text-[13px] font-bold tracking-tight text-white">
                  Official Workshop Bundle Offers
                </span>
              </div>
              <motion.a
                href={bundleClaimUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                className="inline-flex self-start sm:self-auto shrink-0 items-center gap-1.5 rounded-full bg-[#3AB498] px-3.5 py-1.5 font-display text-[11px] font-bold text-[#0B192C] transition-colors hover:bg-[#52C6AB]"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>Claim Bundle</span>
              </motion.a>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {BUNDLE_SUMMARY.map((tier) => (
                <div
                  key={tier.count}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs leading-snug backdrop-blur-sm"
                >
                  <span className="font-display font-bold text-[#8CE9D2]">
                    {tier.count}:{' '}
                  </span>
                  <span className="text-white/90">{tier.perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workshops Drag/Swipe Center-Focus Carousel */}
          <Carousel ariaLabel="Hands-On Workshops" gapClass="gap-4">
            {({ activeIndex }) =>
              workshops.map((workshop, index) => {
                const isActive = index === activeIndex;
                const reserveUrl = buildWhatsAppUrl(
                  conference.whatsapp.number,
                  `Hello, I would like to reserve a seat for the workshop "${workshop.title}" (${workshop.fee}) at DDSC 2026.`
                );

                return (
                  <article
                    key={workshop.id}
                    className={`group snap-center shrink-0 w-[80vw] sm:w-[310px] md:w-[330px] flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card hover:border-[#3AB498]/40 hover:shadow-cardHover transition-all duration-300 ${
                      isActive
                        ? 'scale-100 opacity-100 blur-0'
                        : 'scale-[0.94] opacity-75 blur-[1.5px]'
                    }`}
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectWorkshop(workshop)}
                        className="block w-full text-left focus:outline-none"
                        aria-label={`View details for ${workshop.title}`}
                      >
                        <WorkshopSlidePoster workshop={workshop} />
                      </button>

                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-[10px] font-semibold"
                            style={specialtyPillStyle(workshop.specialty)}
                          >
                            {workshop.specialty}
                          </span>
                          <span className="rounded-lg bg-[#0D224C]/[0.06] px-2 py-0.5 font-display text-[11px] font-bold text-[#0D224C] tabular-nums">
                            {workshop.fee}
                          </span>
                        </div>

                        <h3
                          onClick={() => onSelectWorkshop(workshop)}
                          className="cursor-pointer font-display text-[15px] font-bold leading-snug tracking-tight text-[#0B192C] line-clamp-2 transition-colors group-hover:text-[#0D224C]"
                        >
                          {workshop.title}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-[#64748B] truncate">
                          {workshop.instructor}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-[#475569]">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[#0D224C]" />
                            {workshop.date}
                          </span>
                          <span className="truncate font-medium text-[#086958]">
                            {workshop.room}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <motion.a
                        href={reserveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#086958] px-3.5 py-2.5 font-display text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#065749]"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        <span>Reserve Seat</span>
                      </motion.a>
                    </div>
                  </article>
                );
              })
            }
          </Carousel>
        </motion.section>

        {/* 5. CONFERENCE LEADERSHIP (DDSC 2026 BOARD) */}
        <motion.section
          variants={cardItemVariants}
          aria-label="DDSC 2026 Organizing Leadership"
          className="space-y-4"
        >
          <div>
            <p className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[#3AB498]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3AB498]" />
              ORGANIZING LEADERSHIP
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-[26px] font-extrabold tracking-tight leading-[1.15] text-[#0D224C]">
              DDSC 2026 Board
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
            {boardMembers.map((member) => (
              <BoardMemberCard key={member.id} member={member} />
            ))}
          </div>
        </motion.section>

        {/* 6. VENUE & ACCREDITATION TEASER */}
        <motion.section
          variants={cardItemVariants}
          aria-label="Venue and Accreditation"
          className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card"
        >
          <div className="h-1 w-full bg-brand-gradient" />
          <div className="p-5 sm:p-7 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3AB498]/15 px-2.5 py-0.5 font-display text-[11px] font-semibold text-[#086958]">
                  <Award className="h-3.5 w-3.5" />
                  Accredited Scientific Experience
                </span>
                <span className="font-display text-[11px] font-semibold text-[#64748B]">
                  {conference.datesLabel}
                </span>
              </div>

              <h2 className="mt-2.5 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#0D224C]">
                {conference.venue.name}, Ras El Bar
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">
                Gather with colleagues from across the Delta where the Nile meets the Mediterranean. Two full days of accredited lectures, a curated dental exhibition, and seamless coastal hospitality.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 shrink-0">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('venue')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D224C] px-4 py-2.5 font-display text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#14326B]"
              >
                <MapPin className="h-3.5 w-3.5 text-[#3AB498]" />
                <span>Venue &amp; Travel Info</span>
              </motion.button>

              <motion.a
                href={`tel:${conference.whatsapp.tel}`}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-[#F4F7F9] px-4 py-2.5 font-display text-xs font-semibold text-[#0D224C] transition-colors hover:bg-[#E8EFF4]"
              >
                <Phone className="h-3.5 w-3.5 text-[#086958]" />
                <span dir="ltr" className="tabular-nums">
                  {conference.whatsapp.displayPhone}
                </span>
              </motion.a>

              <motion.a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3AB498]/15 px-4 py-2.5 font-display text-xs font-semibold text-[#086958] transition-colors hover:bg-[#3AB498]/25"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>WhatsApp Team</span>
              </motion.a>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Full-Screen Lecture Poster Lightbox Modal */}
      <AnimatePresence>
        {activeLecturePoster && (
          <motion.div
            key="lecture-poster-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#061024]/90 backdrop-blur-md p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={activeLecturePoster.label}
            onClick={() => setLightboxIdx(null)}
          >
            {/* Top Bar */}
            <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
              <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 font-display text-xs font-semibold text-white tabular-nums backdrop-blur-md">
                {lightboxIdx + 1} / {lecturePosters.length}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setLightboxIdx(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                aria-label="Close lecture poster lightbox"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Desktop Prev */}
            {lecturePosters.length > 1 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPoster();
                }}
                className="hidden sm:flex fixed left-5 z-20 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                aria-label="Previous lecture poster"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            )}

            {/* Zoomed Poster */}
            <motion.div
              key={activeLecturePoster.id}
              variants={lightboxZoomVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md sm:max-w-lg aspect-[4/5] max-h-[82vh] overflow-hidden rounded-3xl border border-white/15 bg-[#0B192C] shadow-2xl"
            >
              <img
                src={activeLecturePoster.src}
                alt={activeLecturePoster.label}
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Desktop Next */}
            {lecturePosters.length > 1 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPoster();
                }}
                className="hidden sm:flex fixed right-5 z-20 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                aria-label="Next lecture poster"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            )}

            {/* Mobile Prev / Next */}
            {lecturePosters.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="fixed bottom-6 inset-x-0 z-20 flex sm:hidden items-center justify-center gap-4"
              >
                <button
                  type="button"
                  onClick={handlePrevPoster}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-md active:scale-95"
                  aria-label="Previous lecture poster"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPoster}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-md active:scale-95"
                  aria-label="Next lecture poster"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
