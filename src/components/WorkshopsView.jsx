import { useState, useEffect, useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Calendar, MapPin, CheckCircle2, Info, Gift } from 'lucide-react';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon } from './WhatsAppIcon';
import { SectionHeading } from './SectionHeading';
import { buildWhatsAppUrl } from '../utils/time';
import { specialtyPillStyle } from '../utils/specialty';
import { staggerListVariants, cardItemVariants, EASE_OUT } from '../utils/motion';

const PILL_SPRING = { type: 'spring', stiffness: 460, damping: 36 };

const BUNDLE_TIERS = [
  {
    count: '2 Workshops',
    perk: 'Free Conference Ticket OR 50% OFF the 3rd Workshop',
  },
  {
    count: '3 Workshops',
    perk: '4th Workshop FREE',
  },
  {
    count: '4 Workshops',
    perk: '5th Workshop + Conference Ticket FREE',
  },
];

const DATE_FILTERS = [
  { id: 'all', label: 'All Dates' },
  { id: '2026-11-20', label: '20 Nov' },
  { id: '2026-11-22', label: '22 Nov' },
  { id: '2026-11-24', label: '24 Nov' },
  { id: '2026-11-25', label: '25 Nov' },
];

function buildImageCandidates(basePath) {
  if (!basePath) return [];
  return [
    basePath,
    basePath.endsWith('.jpg') ? `${basePath}.jpg` : null,
    basePath.endsWith('.jpg') ? `${basePath}.jpeg` : null,
  ].filter(Boolean);
}

function OptionalPromoPoster() {
  const candidates = buildImageCandidates('/workshops/bundle-offer.jpg');
  const [srcIdx, setSrcIdx] = useState(0);
  const activeSrc = candidates[srcIdx] || null;

  if (!activeSrc) return null;

  return (
    <div className="hidden md:block shrink-0 w-36 aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-sm">
      <img
        src={activeSrc}
        alt="Book 2 Workshops & Get a Special Discount"
        loading="lazy"
        onError={() => setSrcIdx((i) => i + 1)}
        className="w-full h-full object-cover scale-100"
      />
    </div>
  );
}

function WorkshopPosterHeader({ workshop }) {
  const candidates = buildImageCandidates(workshop.poster);
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
          onError={() => setSrcIdx((i) => i + 1)}
          className="w-full h-full object-cover scale-100"
        />
      ) : (
        <div className="relative flex h-full w-full flex-col justify-between p-5 text-white">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-8 -bottom-12 h-40 w-40 rounded-full bg-[#3AB498]/20 blur-2xl"
            aria-hidden="true"
          />
          <img
            src={logoWhite}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-2 -bottom-5 h-36 w-auto opacity-[0.08]"
          />

          <div className="relative z-10 flex items-center justify-between gap-2">
            <img
              src={logoWhite}
              alt="DDSC"
              className="h-9 w-auto opacity-95"
            />
            <span className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#8CE9D2]">
              {workshop.date} · Hands-On
            </span>
          </div>

          <div className="relative z-10">
            <h3 className="font-display text-base font-bold leading-snug text-white line-clamp-2">
              {workshop.title}
            </h3>
            <p className="mt-1 text-xs font-medium text-white/80 line-clamp-1">
              {workshop.instructor}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkshopsView({ workshops, conference, onSelectWorkshop }) {
  const [dateFilter, setDateFilter] = useState('all');

  const filteredWorkshops = useMemo(() => {
    if (dateFilter === 'all') return workshops;
    return workshops.filter((w) => w.dateKey === dateFilter);
  }, [workshops, dateFilter]);

  const bundleClaimUrl = buildWhatsAppUrl(
    conference.whatsapp.number,
    conference.whatsapp.bundleMessage ||
      'Hello, I would like to book a DDSC 2026 Workshop Bundle'
  );

  return (
    <div className="space-y-6">
      {/* Official Workshop Bundle Offers Banner */}
      <section
        aria-label="Workshop Bundle Offers"
        className="relative overflow-hidden rounded-2xl bg-brand-gradient p-5 sm:p-6 text-white shadow-card"
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#3AB498]/20 blur-3xl"
          aria-hidden="true"
        />
        <img
          src={logoWhite}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -right-3 -bottom-5 h-36 w-auto opacity-[0.06]"
        />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center">
          <OptionalPromoPoster />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3AB498]/20 text-[#8CE9D2]">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-[#8CE9D2]">
                    DDSC 2026 Workshop Bundle Offers
                  </span>
                  <h2 className="font-display text-base sm:text-lg font-extrabold tracking-tight text-white leading-snug">
                    Book 2 Workshops &amp; Get a Special Discount
                  </h2>
                </div>
              </div>

              <motion.a
                href={bundleClaimUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex self-start sm:self-auto shrink-0 items-center gap-1.5 rounded-full bg-[#3AB498] px-4 py-2 font-display text-xs font-bold text-[#0B192C] shadow-sm transition-colors hover:bg-[#52C6AB]"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>Claim Bundle Offer</span>
              </motion.a>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {BUNDLE_TIERS.map((tier) => (
                <div
                  key={tier.count}
                  className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm px-3.5 py-2.5"
                >
                  <span className="inline-block rounded-md bg-[#3AB498]/25 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-[#A7F3E2]">
                    {tier.count}
                  </span>
                  <p className="mt-1.5 font-display text-xs font-semibold leading-snug text-white">
                    {tier.perk}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Unified Section Heading */}
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow="Pre-Conference Labs"
        title="Hands-On Workshops"
        description="Small-group clinical courses across Damietta (20–25 Nov) built around practical chairside skills and accredited certification."
        aside={
          <span className="inline-flex rounded-full border border-slate-200/70 bg-white px-3.5 py-1.5 font-display text-xs font-semibold text-[#086958] shadow-xs tabular-nums">
            {filteredWorkshops.length}{' '}
            {filteredWorkshops.length === 1 ? 'Workshop' : 'Workshops'}
          </span>
        }
      />

      {/* Animated Date Filter Pills */}
      <LayoutGroup id="workshop-dates">
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-xs backdrop-blur-md">
          {DATE_FILTERS.map((option) => {
            const active = dateFilter === option.id;
            return (
              <motion.button
                key={option.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setDateFilter(option.id)}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="workshopDatePill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-[#0D224C] shadow-sm"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* 4:3 Workshop Cards Grid */}
      <motion.div
        key={dateFilter}
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredWorkshops.map((workshop) => {
          const reserveUrl = buildWhatsAppUrl(
            conference.whatsapp.number,
            `Hello, I would like to reserve a seat for the workshop "${workshop.title}" (${workshop.fee}) at DDSC 2026.`
          );

          return (
            <motion.article
              key={workshop.id}
              variants={cardItemVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card transition-[border-color,box-shadow] duration-200 hover:border-[#3AB498]/40 hover:shadow-cardHover"
            >
              <div>
                <button
                  type="button"
                  onClick={() => onSelectWorkshop(workshop)}
                  className="block w-full text-left focus:outline-none"
                  aria-label={`View full details for ${workshop.title}`}
                >
                  <WorkshopPosterHeader workshop={workshop} />
                </button>

                <div className="p-4 sm:p-5">
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-[11px] font-semibold"
                      style={specialtyPillStyle(workshop.specialty)}
                    >
                      {workshop.specialty}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3AB498] px-2.5 py-0.5 font-display text-[10px] font-bold text-[#0B192C]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0D224C] animate-pulse" />
                      {workshop.seatsLeft} seats left
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2.5">
                    <h2
                      onClick={() => onSelectWorkshop(workshop)}
                      className="cursor-pointer font-display text-[15px] sm:text-base font-bold leading-snug tracking-tight text-[#0B192C] transition-colors group-hover:text-[#0D224C]"
                    >
                      {workshop.title}
                    </h2>
                    <span className="shrink-0 whitespace-nowrap rounded-lg bg-[#0D224C]/[0.06] px-2.5 py-1 font-display text-xs font-bold text-[#0D224C] tabular-nums">
                      {workshop.fee}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs font-semibold text-[#0B192C]/80">
                    {workshop.instructor}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-[#F4F7F9] px-3 py-2 text-[11px] font-medium text-[#475569]">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#0D224C]" />
                      {workshop.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#086958]" />
                      {workshop.room}
                    </span>
                  </div>

                  <ul className="mt-3.5 space-y-1.5">
                    {workshop.highlights.slice(0, 2).map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-xs leading-relaxed text-[#475569]"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#3AB498]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 flex items-center gap-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectWorkshop(workshop)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/70 bg-[#F4F7F9] px-3.5 py-2.5 font-display text-xs font-semibold text-[#0D224C] transition-colors hover:bg-[#E8EFF4]"
                >
                  <Info className="h-3.5 w-3.5 text-[#086958]" />
                  <span>Details</span>
                </motion.button>

                <motion.a
                  href={reserveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#086958] px-4 py-2.5 font-display text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#065749]"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  <span>Reserve Seat</span>
                </motion.a>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
