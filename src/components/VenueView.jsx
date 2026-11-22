import { motion } from 'framer-motion';
import {
  MapPin,
  ExternalLink,
  Clock,
  Sparkles,
  Moon,
  Building2,
  Calendar,
  Phone,
} from 'lucide-react';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon } from './WhatsAppIcon';
import { SectionHeading } from './SectionHeading';

function getTimingIcon(id) {
  switch (id) {
    case 'opening':
      return Sparkles;
    case 'prayer':
      return Moon;
    case 'exhibition':
      return Building2;
    case 'registration':
      return Calendar;
    default:
      return Clock;
  }
}

export function VenueView({ conference, bookingUrl, supportUrl }) {
  const { venue, keyTimings } = conference;

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow="Plan Your Visit"
        title="Venue & Info"
        description="Directions to Steigenberger Hotel El Lessan, key conference timings, and direct organizer support."
      />

      {/* Venue Card: Steigenberger Hotel El Lessan */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
        <div className="relative overflow-hidden bg-brand-gradient px-5 py-6 sm:px-7 sm:py-8 text-white">
          <img
            src={logoWhite}
            alt=""
            aria-hidden="true"
            className="pointer-events-none select-none absolute -right-4 -bottom-6 h-44 w-auto opacity-[0.07]"
          />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-display text-[11px] font-semibold text-[#8CE9D2]">
                <MapPin className="h-3.5 w-3.5" />
                {venue.city}
              </span>
              <h2 className="mt-3 font-display text-xl sm:text-[26px] font-extrabold tracking-tight leading-tight text-white">
                {venue.name}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-white/80">
                {conference.datesLabel} · {conference.edition}
              </p>
            </div>
            <img
              src={logoWhite}
              alt="DDSC White Logo"
              className="hidden sm:block h-14 w-auto shrink-0 opacity-95"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-sm leading-relaxed text-[#475569]">
            {venue.description}
          </p>
          <p className="mt-2.5 text-xs font-medium text-[#64748B]">
            {venue.address}
          </p>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <motion.a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D224C] px-5 py-3 font-display text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#14326B]"
            >
              <MapPin className="h-4 w-4 text-[#3AB498]" />
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </motion.a>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#64748B] sm:ml-2">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="inline-block h-2 w-2 rounded-full bg-[#0D224C]" />
                <span>Princess Hall (Ground)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className="inline-block h-2 w-2 rounded-full bg-[#086958]" />
                <span>Al Diwan Hall (Level 1)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Grid: Key Timings + Ticket & Support */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
        <section className="md:col-span-3 rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6 shadow-card">
          <h2 className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#0D224C]">
            Key Conference Timings
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            All times are in Cairo local time (GMT+2)
          </p>

          <div className="mt-4 divide-y divide-slate-200/70">
            {keyTimings.map((item) => {
              const Icon = getTimingIcon(item.id);
              const isHighlight = item.id === 'opening' || item.id === 'prayer';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isHighlight
                          ? 'bg-[#3AB498]/15 text-[#086958]'
                          : 'bg-[#F4F7F9] text-[#0D224C]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-xs sm:text-[13px] font-bold leading-snug text-[#0B192C]">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{item.day}</p>
                    </div>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-lg bg-[#F4F7F9] px-2.5 py-1 font-display text-[11px] font-semibold text-[#0D224C] tabular-nums">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="md:col-span-2 flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 sm:p-6 shadow-card">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3AB498]/15 px-2.5 py-1 font-display text-[11px] font-semibold text-[#086958]">
              <WhatsAppIcon className="h-3.5 w-3.5" />
              Registration &amp; Support
            </span>
            <h2 className="mt-3 font-display text-base sm:text-lg font-extrabold tracking-tight text-[#0D224C]">
              Tickets &amp; Organizers Desk
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">
              Book your conference pass, inquire about group registration, or reach the Damietta Dental Syndicate organizing committee directly.
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            <motion.a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#086958] px-4 py-3 font-display text-xs sm:text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#065749]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span>Book Ticket on WhatsApp</span>
            </motion.a>

            <motion.a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-[#F4F7F9] px-4 py-2.5 font-display text-xs font-semibold text-[#0D224C] transition-colors hover:bg-[#E8EFF4]"
            >
              <span>Message Organizers Support</span>
            </motion.a>

            <motion.a
              href={`tel:${conference.whatsapp.tel}`}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#086958]/20 bg-white px-4 py-2.5 font-display text-xs font-semibold text-[#086958] transition-colors hover:bg-[#3AB498]/10"
            >
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr" className="tabular-nums">
                Call {conference.whatsapp.displayPhone}
              </span>
            </motion.a>
          </div>
        </section>
      </div>
    </div>
  );
}
