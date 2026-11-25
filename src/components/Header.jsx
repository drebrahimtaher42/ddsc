import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  // Floating glass pill whenever the header sits over light content
  // (scrolled, or any non-home tab) — same language as the bottom nav.
  const isFloating = !isTransparent;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 md:px-6">
      <div
        className={`pointer-events-auto mx-auto flex items-center justify-between gap-2 border transition-[max-width,margin,height,padding,background-color,border-color,box-shadow,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isFloating
            ? 'mt-3 h-14 max-w-[min(100%,64rem)] rounded-full border-white/15 bg-[#091938]/85 pl-4 pr-2 shadow-[0_16px_40px_rgba(7,20,46,0.35)] backdrop-blur-2xl'
            : 'mt-0 h-16 max-w-5xl rounded-none border-transparent bg-transparent px-1 sm:px-0 shadow-none'
        }`}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AB498]/60"
          aria-label="DDSC 2026 Home"
        >
          <img
            ref={logoRef}
            src={logoWhite}
            alt="DDSC Logo"
            className={`w-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] ${
              isFloating ? 'h-8' : 'h-9 sm:h-10'
            }`}
            style={{ opacity: logoHidden ? 0 : 1 }}
          />
          <div
            className="hidden lg:flex flex-col text-left leading-tight transition-opacity duration-300"
            style={{ opacity: logoHidden ? 0 : 1 }}
          >
            <span className="font-display text-xs font-extrabold tracking-[0.08em] text-white">
              DDSC 2026
            </span>
            <span className="text-[11px] font-medium text-slate-300">29th Edition</span>
          </div>
        </motion.button>

        {/* Desktop: centred pill navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.06] p-1"
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
                  isActive ? 'text-[#06201B]' : 'text-white/70 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="desktopNavPill"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-[#3AB498] shadow-[0_4px_18px_rgba(58,180,152,0.35)]"
                    aria-hidden="true"
                  />
                )}
                <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Get Pass — glass over the hero, solid teal inside the floating pill */}
        <motion.a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-display text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isFloating
              ? 'h-10 pl-3.5 pr-4 border-transparent bg-[#3AB498] text-[#06201B] shadow-[0_4px_18px_rgba(58,180,152,0.35)] hover:brightness-105'
              : 'h-10 pl-3.5 pr-4 border-white/20 bg-white/10 text-white backdrop-blur-xs hover:bg-white/20'
          }`}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Get Pass</span>
        </motion.a>
      </div>
    </header>
  );
}
