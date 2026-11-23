import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, ArrowUpRight, Navigation, ChevronUp } from 'lucide-react';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon, FacebookIcon, InstagramIcon } from './WhatsAppIcon';
import { EASE_OUT } from '../utils/motion';

const columnVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT, delay: 0.06 * i },
  }),
};

function ColumnTitle({ children }) {
  return (
    <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[#8CE9D2]">
      {children}
    </h3>
  );
}

export function Footer({ conference, bookingUrl, supportUrl }) {
  const { venue, whatsapp, social } = conference;
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
  ].filter(Boolean);

  return (
    <>
      <footer className="relative mt-10 overflow-hidden bg-[#0D224C] text-white pb-24 md:pb-8">
        {/* Mint hairline + radial ambient glow */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3AB498]/60 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-36 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full opacity-55 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(58,180,152,0.26), rgba(8,105,88,0.14) 55%, transparent)',
          }}
          aria-hidden="true"
        />
        <img
          src={logoWhite}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute -right-6 bottom-24 md:top-1/2 md:bottom-auto md:-translate-y-1/2 h-64 sm:h-72 w-auto opacity-[0.04]"
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-5 pt-7 pb-3.5 md:grid-cols-12 md:gap-x-8"
          >
            {/* 1. Brand + balanced 2-line tagline */}
            <motion.div
              custom={0}
              variants={columnVariants}
              className="col-span-2 md:col-span-5"
            >
              <div className="flex items-center gap-3">
                <img
                  src={logoWhite}
                  alt="DDSC 2026"
                  className="h-12 w-auto shrink-0"
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
              <p className="mt-4 max-w-xs font-display text-[15px] font-semibold leading-snug tracking-tight text-white">
                The largest annual conference in Delta
                <span className="block font-script text-[26px] sm:text-[28px] font-normal text-[#5EEAD4] leading-tight mt-0.5">
                  A New Era of Dentistry
                </span>
              </p>
              <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-white/60">
                Built around what you actually need to grow in your practice.
              </p>
              <motion.a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3AB498] py-2 pl-3.5 pr-4 font-display text-xs font-bold text-[#0B192C] shadow-sm transition-colors hover:bg-[#52C6AB]"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
                <span>Book Your Pass</span>
              </motion.a>
            </motion.div>

            {/* 2. Venue & direct contact */}
            <motion.div
              custom={1}
              variants={columnVariants}
              className="md:col-span-4"
            >
              <ColumnTitle>Venue &amp; Contact</ColumnTitle>
              <div className="mt-2.5 space-y-2 text-[13px] sm:text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3AB498]" />
                  <div className="leading-snug">
                    <p className="font-semibold text-white">{venue.name}</p>
                    <p className="text-xs text-white/60">Ras El Bar, Damietta</p>
                  </div>
                </div>
                <a
                  href={venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-white/75 transition-colors hover:text-white"
                >
                  <Navigation className="h-3.5 w-3.5 shrink-0 text-[#3AB498]" />
                  <span>Get directions</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <a
                  href={`tel:${whatsapp.tel}`}
                  className="flex items-center gap-2 text-white/75 transition-colors hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-[#3AB498]" />
                  <span dir="ltr" className="whitespace-nowrap font-medium tabular-nums">
                    {whatsapp.displayPhone}
                  </span>
                </a>
                <a
                  href={supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/75 transition-colors hover:text-white"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5 text-[#3AB498]" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </motion.div>

            {/* 3. Follow DDSC (Facebook & Instagram only) */}
            <motion.div
              custom={2}
              variants={columnVariants}
              className="md:col-span-3"
            >
              <ColumnTitle>Follow DDSC</ColumnTitle>
              <div className="mt-2.5 flex items-center gap-2.5">
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
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[#3AB498]/20 bg-white/[0.04] text-white/80 backdrop-blur-md transition-colors hover:border-[#3AB498]/60 hover:bg-[#086958] hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Compact copyright strip */}
          <div className="flex flex-col items-center justify-between gap-1 border-t border-[#3AB498]/15 pt-3 pb-0 text-center text-xs text-white/50 sm:flex-row sm:text-left">
            <p>© 2026 Damietta Dental Syndicate Conference · All rights reserved</p>
            <p className="font-display font-semibold tracking-wide text-white/60">
              #DDSC2026
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Scroll-to-Top Button (cleanly above right side of mobile dock) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-top"
            type="button"
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#091938]/90 text-white shadow-lg backdrop-blur-xl transition-colors hover:bg-[#086958]"
          >
            <ChevronUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
