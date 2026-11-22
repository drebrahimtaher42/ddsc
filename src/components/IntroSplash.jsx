import { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';
import logoWhite from '../assets/logo-white.svg';
import logoNavy from '../assets/logo-navy.svg';

export const INTRO_STORAGE_KEY = 'ddsc2026_intro_seen';

export function shouldPlayIntro() {
  try {
    if (window.sessionStorage.getItem(INTRO_STORAGE_KEY) === '1') return false;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Signature splash: centred white DDSC mark on the brand gradient → brief hold →
 * GPU-only glide (translate + scale) into the header logo slot while the
 * mark cross-fades white → navy and the backdrop dissolves.
 */
export function IntroSplash({ targetRef, onComplete }) {
  const [scope, animate] = useAnimate();
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      try {
        window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
      } catch {
        // ignore storage errors
      }
      onComplete();
    };

    const run = async () => {
      // 1. Entrance
      await animate(
        '[data-intro-logo]',
        { opacity: [0, 1], scale: [0.9, 1] },
        { duration: 0.14, ease: [0.22, 1, 0.36, 1] }
      );
      if (cancelled) return;

      // 2. Hold
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;

      // 3. Glide into header slot
      const logoEl = scope.current?.querySelector('[data-intro-logo]');
      const target = targetRef.current;
      if (!logoEl || !target) {
        finish();
        return;
      }
      const from = logoEl.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const scale = to.height / from.height;
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);

      scope.current.style.pointerEvents = 'none';

      const glide = { duration: 0.42, ease: [0.65, 0, 0.2, 1] };
      await Promise.all([
        animate('[data-intro-logo]', { x: dx, y: dy, scale }, glide),
        animate('[data-intro-white]', { opacity: 0 }, { ...glide, duration: 0.34 }),
        animate('[data-intro-navy]', { opacity: 1 }, { ...glide, duration: 0.34 }),
        animate('[data-intro-backdrop]', { opacity: 0 }, { duration: 0.38, ease: 'easeOut' }),
      ]);
      if (!cancelled) finish();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [animate, scope, targetRef, onComplete]);

  return (
    <div
      ref={scope}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      aria-hidden="true"
    >
      <div
        data-intro-backdrop
        className="absolute inset-0 bg-brand-gradient"
        style={{ willChange: 'opacity' }}
      >
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3AB498]/30 blur-3xl" />
      </div>

      <motion.div
        data-intro-logo
        initial={{ opacity: 0 }}
        className="relative h-28 sm:h-32"
        style={{ willChange: 'transform, opacity', aspectRatio: '227.705 / 320.408' }}
      >
        <img
          data-intro-white
          src={logoWhite}
          alt=""
          className="absolute inset-0 h-full w-full"
          style={{ filter: 'drop-shadow(0 10px 30px rgba(58, 180, 152, 0.35))' }}
        />
        <img
          data-intro-navy
          src={logoNavy}
          alt=""
          className="absolute inset-0 h-full w-full opacity-0"
        />
      </motion.div>
    </div>
  );
}
