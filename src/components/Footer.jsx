import { motion } from 'framer-motion';
import { MapPin, Phone, ArrowUpRight, Navigation } from 'lucide-react';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon, FacebookIcon, InstagramIcon } from './WhatsAppIcon';
import { EASE_OUT } from '../utils/motion';

const columnVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.06 * i },
  }),
};

function ColumnTitle({ children }) {
  return (
    <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[#8CE9D2]">
      {children}
    </h3>
  );
}

export function Footer({
  tabs,
  activeTab,
  onTabChange,
  conference,
  bookingUrl,
  supportUrl,
}) {
  const { venue, whatsapp, social } = conference;

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    social?.facebook && {
      href: social.facebook,
      label: 'DDSC on Facebook',
      Icon: FacebookIcon,
    },
    social?.instagram && {
      href: social.instagram,
      label: 'DDSC on Instagram',
      Icon: InstagramIcon,
    },
    {
      href: bookingUrl,
      label: 'DDSC on WhatsApp',
      Icon: WhatsAppIcon,
    },
  ].filter(Boolean);

  return (
    <footer className="relative mt-14 overflow-hidden bg-[#0D224C] text-white pb-28 md:pb-0">
      {/* Mint hairline + radial ambient glow */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3AB498]/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(58,180,152,0.28), rgba(8,105,88,0.16) 55%, transparent)',
        }}
        aria-hidden="true"
      />
      <img
        src={logoWhite}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -right-10 -bottom-16 h-80 w-auto opacity-[0.035]"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-2 gap-x-6 gap-y-10 pt-12 pb-10 md:grid-cols-12 md:gap-x-8"
        >
          {/* 1. Brand + tagline */}
          <motion.div
            custom={0}
            variants={columnVariants}
            className="col-span-2 md:col-span-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={logoWhite}
                alt="DDSC 2026"
                className="h-14 w-auto shrink-0"
              />
              <div className="leading-tight">
                <p className="font-display text-sm font-extrabold tracking-tight text-white">
                  DDSC 2026
                </p>
                <p className="mt-0.5 text-xs text-white/60">
                  {conference.edition} · {conference.datesLabel}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-xs font-display text-[15px] font-semibold leading-snug tracking-tight text-white">
              The largest annual conference in Delta —{' '}
              <span className="text-[#8CE9D2]">A New Era of Dentistry</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
              Built around what you actually need to grow in your practice.
            </p>
            <motion.a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3AB498] py-2.5 pl-3.5 pr-4 font-display text-xs font-bold text-[#0B192C] shadow-sm transition-colors hover:bg-[#52C6AB]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span>Book Your Pass</span>
            </motion.a>
          </motion.div>

          {/* 2. Quick navigation */}
          <motion.nav
            custom={1}
            variants={columnVariants}
            aria-label="Footer Navigation"
            className="md:col-span-2"
          >
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="mt-4 space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(tab.id)}
                      className={`group inline-flex min-h-[2.1rem] items-center gap-2 text-sm transition-colors ${
                        isActive
                          ? 'font-semibold text-white'
                          : 'text-white/65 hover:text-white'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                          isActive
                            ? 'bg-[#3AB498] scale-100'
                            : 'bg-white/30 scale-75 group-hover:bg-[#3AB498] group-hover:scale-100'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.nav>

          {/* 3. Venue & direct contact */}
          <motion.div
            custom={2}
            variants={columnVariants}
            className="md:col-span-3"
          >
            <ColumnTitle>Venue &amp; Contact</ColumnTitle>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3AB498]" />
                <div className="leading-snug">
                  <p className="font-semibold text-white">{venue.name}</p>
                  <p className="mt-0.5 text-white/60">Ras El Bar, Damietta</p>
                </div>
              </div>
              <a
                href={venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 text-white/75 transition-colors hover:text-white"
              >
                <Navigation className="h-4 w-4 shrink-0 text-[#3AB498]" />
                <span>Get directions</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href={`tel:${whatsapp.tel}`}
                className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-[#3AB498]" />
                <span dir="ltr" className="font-medium tabular-nums">
                  {whatsapp.displayPhone}
                </span>
              </a>
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-white/75 transition-colors hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#3AB498]" />
                <span>WhatsApp the organizers</span>
              </a>
            </div>
          </motion.div>

          {/* 4. Social */}
          <motion.div
            custom={3}
            variants={columnVariants}
            className="md:col-span-3"
          >
            <ColumnTitle>Follow DDSC</ColumnTitle>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Speaker reveals, workshop drops and live updates from the halls.
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              {socialLinks.map(({ href, label, Icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[#3AB498]/20 bg-white/[0.04] text-white/80 backdrop-blur-md transition-colors hover:border-[#3AB498]/60 hover:bg-[#086958] hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#3AB498]/15 py-5 text-center text-xs text-white/50 sm:flex-row sm:text-left">
          <p>© 2026 Damietta Dental Syndicate Conference · All rights reserved</p>
          <p className="font-display font-semibold tracking-wide text-white/60">
            #DDSC2026
          </p>
        </div>
      </div>
    </footer>
  );
}
