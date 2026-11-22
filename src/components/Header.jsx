import { motion } from 'framer-motion';
import logoNavy from '../assets/logo-navy.svg';
import { WhatsAppIcon } from './WhatsAppIcon';

export function Header({
  tabs,
  activeTab,
  onTabChange,
  bookingUrl,
  logoRef,
  logoHidden = false,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6 sm:py-3">
        {/* Crisp Navy DDSC mark (intro splash glides into this slot) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#086958]/50"
          aria-label="DDSC 2026 Home"
        >
          <img
            ref={logoRef}
            src={logoNavy}
            alt="DDSC Logo"
            className="h-9 w-auto sm:h-10 transition-transform duration-200 group-hover:scale-[1.03]"
            style={{ opacity: logoHidden ? 0 : 1 }}
          />
          <div
            className="hidden lg:flex flex-col text-left leading-tight transition-opacity duration-300"
            style={{ opacity: logoHidden ? 0 : 1 }}
          >
            <span className="font-display text-xs font-extrabold tracking-[0.08em] text-[#0D224C]">
              DDSC 2026
            </span>
            <span className="text-[11px] font-medium text-[#64748B]">
              29th Edition
            </span>
          </div>
        </motion.button>

        {/* Desktop: centred pill navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-0.5 rounded-full border border-slate-200/70 bg-slate-100/75 p-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 rounded-full px-2.5 lg:px-3.5 py-1.5 font-display text-xs font-semibold transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktopNavPill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-[#0D224C] shadow-sm"
                    aria-hidden="true"
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sleek compact Get Pass pill */}
        <motion.a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#086958] py-2 pl-3.5 pr-4 font-display text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#065749] hover:shadow-md"
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Get Pass</span>
        </motion.a>
      </div>
    </header>
  );
}
