import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logoNavy from '../assets/logo-navy.svg';
import logoWhite from '../assets/logo-white.svg';
import { WhatsAppIcon } from './WhatsAppIcon';

export function Header({
  tabs,
  activeTab,
  onTabChange,
  bookingUrl,
  logoRef,
  logoHidden = false,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const isHome = !activeTab || activeTab === 'home';
  const isTransparent = isHome && !isScrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-16 border-b transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent backdrop-blur-none border-transparent shadow-none'
          : 'bg-white/85 backdrop-blur-md border-slate-200/75 shadow-xs'
      }`}
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Crisp DDSC mark (white over Hero, navy when frosted) */}
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
            src={isTransparent ? logoWhite : logoNavy}
            alt="DDSC Logo"
            className="h-9 w-auto sm:h-10 transition-transform duration-200 group-hover:scale-[1.03]"
            style={{ opacity: logoHidden ? 0 : 1 }}
          />
          <div
            className="hidden lg:flex flex-col text-left leading-tight transition-opacity duration-300"
            style={{ opacity: logoHidden ? 0 : 1 }}
          >
            <span
              className={`font-display text-xs font-extrabold tracking-[0.08em] transition-colors duration-300 ${
                isTransparent ? 'text-white' : 'text-[#0D224C]'
              }`}
            >
              DDSC 2026
            </span>
            <span
              className={`text-[11px] font-medium transition-colors duration-300 ${
                isTransparent ? 'text-slate-300' : 'text-[#64748B]'
              }`}
            >
              29th Edition
            </span>
          </div>
        </motion.button>

        {/* Desktop: centred pill navigation */}
        <nav
          aria-label="Primary Navigation"
          className={`hidden md:flex items-center gap-0.5 rounded-full border p-1 transition-colors duration-300 ${
            isTransparent
              ? 'border-white/15 bg-white/10 backdrop-blur-xs'
              : 'border-slate-200/70 bg-slate-100/75'
          }`}
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
                  isActive
                    ? 'text-white'
                    : isTransparent
                    ? 'text-white/75 hover:text-white'
                    : 'text-[#64748B] hover:text-[#0D224C]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktopNavPill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className={`absolute inset-0 rounded-full shadow-sm ${
                      isTransparent ? 'bg-white/20' : 'bg-[#0D224C]'
                    }`}
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
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border py-2 pl-3.5 pr-4 font-display text-xs font-semibold text-white transition-all duration-300 ${
            isTransparent
              ? 'bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-xs'
              : 'bg-[#086958] hover:bg-[#065749] border-transparent shadow-sm hover:shadow-md'
          }`}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Get Pass</span>
        </motion.a>
      </div>
    </header>
  );
}
