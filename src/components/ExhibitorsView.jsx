import { useState, useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Tag, MapPin } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { staggerListVariants, cardItemVariants, EASE_OUT } from '../utils/motion';

const PILL_SPRING = { type: 'spring', stiffness: 460, damping: 36 };
const CATEGORIES = ['All', 'Implants', 'Equipment', 'Materials', 'Digital & Lab'];

export function ExhibitorsView({ exhibitors }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredExhibitors = useMemo(() => {
    if (selectedCategory === 'All') return exhibitors;
    return exhibitors.filter((item) => item.category === selectedCategory);
  }, [exhibitors, selectedCategory]);

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow="Dental Exhibition"
        title="Exhibitors & Sponsors"
        description="Meet leading global and regional dental brands showcasing clinical innovations and exclusive conference offers."
        aside={
          <span className="inline-flex rounded-full border border-slate-200/70 bg-white px-3.5 py-1.5 font-display text-xs font-semibold text-[#086958] shadow-xs tabular-nums">
            {filteredExhibitors.length} Partners
          </span>
        }
      />

      {/* Category Filter Pills */}
      <LayoutGroup id="exhibitor-categories">
        <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-xs backdrop-blur-md">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <motion.button
                key={category}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category)}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="exhibitorCatPill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-[#0D224C] shadow-sm"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10">{category}</span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Staggered Exhibitor Grid */}
      <motion.div
        key={selectedCategory}
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredExhibitors.map((exhibitor) => (
          <motion.article
            key={exhibitor.id}
            variants={cardItemVariants}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-[#3AB498]/40 hover:shadow-cardHover"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-16 items-center justify-center rounded-xl border border-slate-200/70 bg-[#F4F7F9]">
                  <span className="font-display text-base font-extrabold tracking-tight text-[#0D224C]">
                    {exhibitor.shortCode}
                  </span>
                </div>

                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full bg-[#0D224C]/[0.06] px-2.5 py-1 font-display text-[11px] font-bold text-[#0D224C] tabular-nums">
                  <MapPin className="h-3 w-3 text-[#086958]" />
                  Booth {exhibitor.booth}
                </span>
              </div>

              <div className="mt-4">
                <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  {exhibitor.category}
                </span>
                <h2 className="mt-1 font-display text-[15px] font-bold tracking-tight text-[#0B192C] leading-snug">
                  {exhibitor.name}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                  {exhibitor.tagline}
                </p>
              </div>
            </div>

            {exhibitor.conferenceDeal && (
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full bg-[#3AB498]/15 px-2.5 py-1 font-display text-[11px] font-semibold text-[#086958]">
                  <Tag className="h-3 w-3 shrink-0" />
                  Conference Deal
                </span>
                <span className="text-[11px] font-medium text-[#086958] truncate">
                  {exhibitor.conferenceDeal}
                </span>
              </div>
            )}
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
