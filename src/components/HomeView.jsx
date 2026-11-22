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
  Presentation,
  Microscope,
  Store,
} from 'lucide-react';
import lecturePosters from 'virtual:lecture-posters';
import boardMembers from '../data/board.json';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Carousel } from './Carousel';
import { SectionHeading } from './SectionHeading';
import { buildWhatsAppUrl } from '../utils/time';
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

export function HomeView({
  conference,
  workshops,
  bookingUrl,
  supportUrl,
  onNavigate,
  onSelectWorkshop,
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
      value: '27+',
      label: 'Scientific Lectures',
      sub: 'Two parallel halls',
      icon: Presentation,
      target: 'schedule',
    },
    {
      value: String(workshops.length),
      label: 'Hands-On Workshops',
      sub: 'Pre-conference labs',
      icon: Microscope,
      target: 'workshops',
    },
    {
      value: 'Top',
      label: 'Dental Exhibitors',
      sub: 'Exclusive deals',
      icon: Store,
      target: 'exhibitors',
    },
  ];

  return (
    <div>
      {/* 1. IMMERSIVE FULL-BLEED LUXURY HERO */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#07142E] via-[#091A3C] to-[#0D224C] text-white">
        {/* Soft Radial Ambient Emerald / Mint Mesh Glows (15–20% opacity) */}
        <motion.div
          aria-hidden="true"
          animate={{
            x: [0, 30, -14, 0],
            y: [0, -16, 12, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-28 right-[8%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(58,180,152,0.18) 0%, rgba(8,105,88,0.14) 45%, transparent 72%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(8,105,88,0.20) 0%, rgba(58,180,152,0.10) 45%, transparent 72%)',
          }}
        />
        {/* Subtle fine architectural grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Very faint, large architectural DDSC watermark on far right */}
        <img
          src={logoWhite}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -right-10 sm:right-[4%] top-1/2 -translate-y-1/2 h-[20rem] sm:h-[27rem] w-auto opacity-[0.04]"
        />

        {/* Editorial Content Container */}
        <motion.div
          variants={staggerListVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto max-w-5xl px-4 pt-12 pb-24 sm:px-6 sm:pt-20 sm:pb-32"
        >
          <div className="max-w-2xl">
            {/* Single Minimalist Micro-Badge */}
            <motion.div variants={cardItemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 font-display text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#6EE7B7] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3AB498]" />
                <span>26–27 NOV 2026 • STEIGENBERGER EL LESSAN</span>
              </span>
            </motion.div>

            {/* High-Contrast Display Headline */}
            <motion.h1
              variants={cardItemVariants}
              className="mt-6 font-display text-3xl sm:text-5xl font-bold tracking-tight leading-[1.12] bg-gradient-to-r from-white via-white to-[#6EE7B7] bg-clip-text text-transparent"
            >
              A New Era of Dentistry
            </motion.h1>

            {/* Refined Conference Subtitle */}
            <motion.p
              variants={cardItemVariants}
              className="mt-3 font-display text-base sm:text-xl font-semibold tracking-tight text-white/90"
            >
              Damietta Dental Syndicate Conference 2026
            </motion.p>

            {/* Lead Paragraph & Official Campaign Pillars */}
            <motion.p
              variants={cardItemVariants}
              className="mt-4 text-slate-300/90 text-sm sm:text-base max-w-xl leading-relaxed"
            >
              A journey, not just a conference — uniting{' '}
              <span className="whitespace-nowrap">27+ scientific keynotes,</span>
              <br />
              hands-on clinical labs, and a dental community growing since 1995.
            </motion.p>

            <motion.div variants={cardItemVariants} className="mt-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 font-display text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-[#8CE9D2]">
                MEET · SHARE · CONNECT
              </span>
            </motion.div>

            {/* Single Primary Hero CTA */}
            <motion.div
              variants={cardItemVariants}
              className="mt-8 flex items-center"
            >
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('schedule')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3AB498] hover:bg-[#4EC5A9] px-6 py-3.5 font-display text-sm font-semibold text-[#07142E] shadow-[0_8px_24px_rgba(58,180,152,0.3)] transition-colors"
              >
                <span>Explore Schedule</span>
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* Smooth Multi-Stop Bottom Fade into Page Canvas (#F4F7F9) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28"
          style={{
            background:
              'linear-gradient(to bottom, rgba(244, 247, 249, 0) 0%, rgba(244, 247, 249, 0.22) 38%, rgba(244, 247, 249, 0.72) 74%, #F4F7F9 100%)',
          }}
        />
      </section>

      {/* BELOW-THE-FOLD EDITORIAL SECTIONS */}
      <motion.div
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl px-4 pb-4 sm:px-6 space-y-8 sm:space-y-10"
      >
        {/* 2. CONFERENCE HIGHLIGHTS STRIP (floats across the soft Hero fade) */}
        <motion.section
          variants={cardItemVariants}
          aria-label="Conference Highlights"
          className="-mt-8 sm:-mt-10 relative z-10 grid grid-cols-3 gap-2.5 sm:gap-4"
        >
          {highlights.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.button
                key={stat.label}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(stat.target)}
                className="group flex flex-col items-start justify-between rounded-2xl border border-slate-200/70 bg-white p-3.5 sm:p-5 text-left shadow-card transition-[border-color,box-shadow] duration-200 hover:border-[#3AB498]/45 hover:shadow-cardHover"
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-display text-xl sm:text-[28px] font-extrabold tracking-tight text-[#0D224C] tabular-nums">
                    {stat.value}
                  </span>
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#3AB498]/15 text-[#086958] transition-colors group-hover:bg-[#086958] group-hover:text-white">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                </div>
                <div className="mt-2.5">
                  <span className="block font-display text-[11px] sm:text-[13px] font-bold leading-snug text-[#0B192C]">
                    {stat.label}
                  </span>
                  <span className="hidden sm:block mt-0.5 text-xs text-[#64748B]">
                    {stat.sub}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.section>

        {/* 3. SLIDE 1 — SCIENTIFIC SESSIONS CAROUSEL */}
        <motion.section
          variants={cardItemVariants}
          aria-label="Scientific Sessions"
          className="space-y-4"
        >
          <SectionHeading
            eyebrow="2026 Program"
            title="Scientific Sessions"
            description={`${lecturePosters.length} accredited keynote & specialty lectures across two halls. Tap any session to view full details.`}
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

          <Carousel ariaLabel="Official Lecture Posters" gapClass="gap-3.5">
            {lecturePosters.map((poster, index) => (
              <motion.button
                key={poster.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: EASE_OUT }}
                onClick={() => setLightboxIdx(index)}
                className="group relative snap-start shrink-0 w-[235px] sm:w-[260px] aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200/70 bg-[#0D224C] shadow-card hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-[#086958]"
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
              </motion.button>
            ))}
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

          {/* Workshops Drag/Swipe Carousel */}
          <Carousel ariaLabel="Hands-On Workshops" gapClass="gap-4">
            {workshops.map((workshop) => {
              const reserveUrl = buildWhatsAppUrl(
                conference.whatsapp.number,
                `Hello, I would like to reserve a seat for the workshop "${workshop.title}" (${workshop.fee}) at DDSC 2026.`
              );

              return (
                <motion.article
                  key={workshop.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="group snap-start shrink-0 w-[285px] sm:w-[315px] flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card transition-[border-color,box-shadow] duration-200 hover:border-[#3AB498]/40 hover:shadow-cardHover"
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
                </motion.article>
              );
            })}
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
