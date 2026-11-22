import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Snap-scrolling carousel with:
 * - native touch swipe + CSS scroll-snap
 * - mouse drag-to-scroll on desktop (snap re-engages on release)
 * - edge fade masks, scroll progress hairline, sleek arrow controls
 */
export function Carousel({ children, ariaLabel, gapClass = 'gap-4' }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? el.scrollLeft / max : 1;
    setProgress(Math.min(1, Math.max(0, ratio)));
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    updateState();
    el.addEventListener('scroll', updateState, { passive: true });
    window.addEventListener('resize', updateState);
    return () => {
      el.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, [updateState]);

  const scrollByPage = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const distance = Math.max(240, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = trackRef.current;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const el = trackRef.current;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (d.moved > 4 && !isDragging) setIsDragging(true);
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    // Allow snap to re-engage after the user releases the track
    window.requestAnimationFrame(() => setIsDragging(false));
  };

  // Suppress the click that follows a drag gesture
  const onClickCapture = (e) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  return (
    <div className="relative" aria-roledescription="carousel" aria-label={ariaLabel}>
      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          className={`flex ${gapClass} overflow-x-auto no-scrollbar px-4 sm:px-0 pb-1 select-none ${
            isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
          }`}
          style={{ scrollPaddingInline: '1rem' }}
        >
          {children}
        </div>

        {/* Edge fades */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F4F7F9] to-transparent transition-opacity duration-300 ${
            canPrev ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F4F7F9] to-transparent transition-opacity duration-300 ${
            canNext ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Controls: progress hairline + arrows */}
      <div className="mt-3.5 flex items-center gap-4">
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-[#0D224C]/[0.08]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0D224C] to-[#3AB498]"
            animate={{ width: `${Math.max(12, progress * 100)}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 32 }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => scrollByPage(-1)}
            disabled={!canPrev}
            aria-label="Previous slides"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-[#0D224C] shadow-xs backdrop-blur-md transition-colors hover:bg-[#0D224C] hover:text-white disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => scrollByPage(1)}
            disabled={!canNext}
            aria-label="Next slides"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-[#0D224C] shadow-xs backdrop-blur-md transition-colors hover:bg-[#0D224C] hover:text-white disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
