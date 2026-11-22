import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand, ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react';
import logoWhite from '../assets/logo-white.svg';
import { lightboxZoomVariants, EASE_OUT } from '../utils/motion';

function getPosterGradient(tone) {
  switch (tone) {
    case 'navy':
      return 'linear-gradient(145deg, #091838 0%, #0D224C 55%, #163C6B 100%)';
    case 'emerald':
      return 'linear-gradient(145deg, #074C41 0%, #086958 55%, #1C8E78 100%)';
    default:
      return 'linear-gradient(140deg, #0D224C 0%, #0B4655 52%, #086958 100%)';
  }
}

function PosterArtwork({ poster, large = false }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [poster.image]);

  const showImg = Boolean(poster.image) && !imgFailed;

  if (showImg) {
    return (
      <img
        src={poster.image}
        alt={poster.title}
        loading="lazy"
        onError={() => setImgFailed(true)}
        className={`h-full w-full ${
          large ? 'object-contain bg-[#0B192C]' : 'object-cover scale-100'
        }`}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden text-white ${
        large ? 'p-7 sm:p-10' : 'p-4'
      }`}
      style={{ background: getPosterGradient(poster.tone) }}
    >
      {/* Decorative subtle rings & watermark */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-8 -bottom-12 h-40 w-40 rounded-full bg-[#3AB498]/15 blur-2xl"
        aria-hidden="true"
      />
      <img
        src={logoWhite}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none select-none absolute opacity-[0.08] ${
          large ? 'right-6 bottom-6 h-52 w-auto' : '-right-2 -bottom-4 h-28 w-auto'
        }`}
      />

      {/* Top Row: Badge + Crisp White SVG Mark */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm font-display font-semibold text-[#A7F3E2] ${
            large ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]'
          }`}
        >
          {poster.badge}
        </span>
        <img
          src={logoWhite}
          alt="DDSC"
          className={large ? 'h-12 w-auto opacity-95' : 'h-7 w-auto opacity-95'}
        />
      </div>

      {/* Bottom Copy */}
      <div className="relative z-10">
        <p
          className={`font-display font-semibold uppercase tracking-widest text-[#8CE9D2] ${
            large ? 'text-xs' : 'text-[9px]'
          }`}
        >
          DDSC 2026 · 29th Edition
        </p>
        <h3
          className={`mt-1 font-display font-bold leading-snug text-white ${
            large ? 'text-2xl sm:text-3xl' : 'text-sm'
          }`}
        >
          {poster.title}
        </h3>
        <p
          className={`mt-1 text-white/80 leading-relaxed ${
            large ? 'text-sm sm:text-base max-w-md' : 'text-[11px] line-clamp-2'
          }`}
        >
          {poster.subtitle}
        </p>
        {poster.meta && (
          <div
            className={`mt-3 inline-flex items-center gap-1.5 rounded-lg bg-black/20 font-medium text-white/90 ${
              large ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[10px]'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3AB498]" />
            {poster.meta}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostersShowcase({ posters }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const isOpen = activeIndex !== null;
  const activePoster = isOpen ? posters[activeIndex] : null;

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev - 1 + posters.length) % posters.length
    );
  }, [posters.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev + 1) % posters.length
    );
  }, [posters.length]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, handlePrev, handleNext]);

  return (
    <section aria-label="Conference Highlights" className="pt-2">
      <div className="mb-3 flex items-center gap-2">
        <CalendarRange className="h-[18px] w-[18px] text-[#086958]" />
        <h2 className="font-display text-sm sm:text-base font-bold tracking-tight text-[#0D224C]">
          Conference Highlights
        </h2>
      </div>

      {/* Horizontal Swipeable Strip */}
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {posters.map((poster, index) => (
          <motion.button
            key={poster.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="group relative snap-start shrink-0 w-[240px] sm:w-[260px] aspect-square overflow-hidden rounded-2xl border border-[#0D224C]/[0.08] bg-white text-left shadow-card hover:shadow-cardHover focus:outline-none focus-visible:ring-2 focus-visible:ring-[#086958]"
          >
            <PosterArtwork poster={poster} />
            <span
              className="pointer-events-none absolute right-2.5 top-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white/95 backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:bg-[#3AB498] group-hover:text-[#0B192C]"
              aria-hidden="true"
            >
              <Expand className="h-3.5 w-3.5" />
            </span>
          </motion.button>
        ))}
      </div>

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {activePoster && (
          <motion.div
            key="poster-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#061024]/90 backdrop-blur-md p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={activePoster.title}
            onClick={() => setActiveIndex(null)}
          >
            {/* Top Controls */}
            <div className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
              <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 font-display text-xs font-semibold text-white backdrop-blur-sm">
                {activeIndex + 1} / {posters.length}
              </span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setActiveIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                aria-label="Close poster lightbox"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Prev Button */}
            {posters.length > 1 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="hidden sm:flex fixed left-5 z-20 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                aria-label="Previous poster"
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
            )}

            {/* Zoomed Poster Card */}
            <motion.div
              key={activePoster.id}
              variants={lightboxZoomVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md sm:max-w-lg aspect-square max-h-[82vh] overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
            >
              <PosterArtwork poster={activePoster} large />
            </motion.div>

            {/* Next Button */}
            {posters.length > 1 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="hidden sm:flex fixed right-5 z-20 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                aria-label="Next poster"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            )}

            {/* Mobile Prev / Next Bar */}
            {posters.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="fixed bottom-6 inset-x-0 z-20 flex sm:hidden items-center justify-center gap-4"
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:scale-95"
                  aria-label="Previous poster"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm active:scale-95"
                  aria-label="Next poster"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
