import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoWhite from '../assets/logo-white.svg';

const EASE = [0.22, 1, 0.36, 1];
// Hysteresis: float after 60px, settle back under 20px — no flicker at the edge.
const FLOAT_AT = 60;
const SETTLE_AT = 20;

export function Header({
  tabs,
  activeTab,
  onTabChange,
  logoRef,
  logoHidden = false,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => (prev ? y > SETTLE_AT : y > FLOAT_AT));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const isHome = !activeTab || activeTab === 'home';
  // Floating glass pill whenever the header sits over light content
  // (scrolled, or any non-home tab) — same language as the bottom nav.
  const isFloating = !(isHome && !isScrolled);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 md:px-6">
      <motion.div
        initial={false}
        animate={{
          marginTop: isFloating ? 12 : 0,
          height: isFloating ? 52 : 64,
          paddingLeft: isFloating ? 14 : 4,
          paddingRight: isFloating ? 14 : 4,
          backgroundColor: isFloating ? 'rgba(9,25,56,0.86)' : 'rgba(9,25,56,0)',
          borderColor: isFloating ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0)',
          boxShadow: isFloating
            ? '0 16px 40px rgba(7,20,46,0.35)'
            : '0 16px 40px rgba(7,20,46,0)',
        }}
        transition={{ duration: 0.45, ease: EASE }}
        className={`pointer-events-auto flex w-fit items-center justify-between gap-3 rounded-full border md:w-full md:max-w-5xl ${
          isFloating ? 'backdrop-blur-2xl' : ''
        }`}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group flex items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AB498]/60"
          aria-label="DDSC 2026 Home"
        >
          <motion.img
            ref={logoRef}
            src={logoWhite}
            alt="DDSC Logo"
            initial={false}
            animate={{ height: isFloating ? 28 : 40 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="w-auto"
            style={{ opacity: logoHidden ? 0 : 1 }}
          />

          {/* "29th Edition" opens beside the logo once the pill forms */}
          <AnimatePresence initial={false}>
            {isFloating && !logoHidden && (
              <motion.span
                key="edition"
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: 'auto',
                  opacity: 1,
                  transition: {
                    width: { duration: 0.4, ease: EASE, delay: 0.08 },
                    opacity: { duration: 0.25, delay: 0.2 },
                  },
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                  transition: {
                    opacity: { duration: 0.12 },
                    width: { duration: 0.3, ease: EASE },
                  },
                }}
                className="overflow-hidden md:hidden lg:block"
              >
                <motion.span
                  initial={{ x: -6 }}
                  animate={{ x: 0, transition: { duration: 0.4, ease: EASE, delay: 0.15 } }}
                  className="flex items-center gap-2.5 whitespace-nowrap pl-3"
                >
                  <span className="h-5 w-px bg-white/20" aria-hidden="true" />
                  <span className="font-display text-[12.5px] font-bold tracking-wide text-white">
                    29th <span className="text-[#5EEAD4]">Edition</span>
                  </span>
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Desktop: pill navigation (mobile uses the bottom nav) */}
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
      </motion.div>
    </header>
  );
}
