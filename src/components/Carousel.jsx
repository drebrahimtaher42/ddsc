import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Center-focus snap-scrolling carousel with:
 * - True center snapping (snap-center + balanced edge padding)
 * - Active center slide index tracking for subtle inactive card scale/blur
 * - Mouse drag-to-scroll on desktop + native touch swipe
 * - Clean progress hairline + centered prev/next navigation
 */
export function Carousel({ children, ariaLabel, gapClass = 'gap-4' }) {
  const trackRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const rafRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const computeActive = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const slides = Array.from(el.children);
    const count = slides.length;
    setSlideCount(count);
    if (count === 0) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft <= 12) {
      setActiveIndex(0);
      return;
    }
    if (maxScroll > 12 && el.scrollLeft >= maxScroll - 12) {
      setActiveIndex(count - 1);
      return;
    }

    const trackRect = el.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < count; i += 1) {
      const rect = slides[i].getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(center - trackCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    setActiveIndex(bestIdx);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;

    computeActive();

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        computeActive();
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', computeActive);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', computeActive);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [computeActive]);

  const scrollToIndex = useCallback((targetIdx) => {
    const el = trackRef.current;
    if (!el) return;
    const slides = Array.from(el.children);
    if (slides.length === 0) return;

    const clamped = Math.max(0, Math.min(slides.length - 1, targetIdx));
    const target = slides[clamped];
    const targetLeft =
      target.offsetLeft + target.offsetWidth / 2 - el.clientWidth / 2;

    el.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, []);

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
    window.requestAnimationFrame(() => setIsDragging(false));
  };

  const onClickCapture = (e) => {
    if (drag.current.moved > 6) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  };

  const canPrev = activeIndex > 0;
  const canNext = slideCount > 0 && activeIndex < slideCount - 1;
  const progress = slideCount > 1 ? activeIndex / (slideCount - 1) : 1;

  const renderedChildren =
    typeof children === 'function'
      ? children({ activeIndex, scrollToIndex })
      : children;

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
          className={`relative flex ${gapClass} overflow-x-auto no-scrollbar px-[10vw] sm:px-12 py-2 select-none ${
            isDragging
              ? 'cursor-grabbing snap-none scroll-auto'
              : 'cursor-grab snap-x snap-mandatory scroll-smooth'
          }`}
        >
          {renderedChildren}
        </div>
      </div>

      {/* Controls: progress hairline + center-snap arrows */}
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
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={!canPrev}
            aria-label="Previous slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-[#0D224C] shadow-xs backdrop-blur-md transition-colors hover:bg-[#0D224C] hover:text-white disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={!canNext}
            aria-label="Next slide"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-[#0D224C] shadow-xs backdrop-blur-md transition-colors hover:bg-[#0D224C] hover:text-white disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
