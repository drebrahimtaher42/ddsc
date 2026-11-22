import { useState, useMemo } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { SpeakerAvatar } from './SpeakerAvatar';
import { SectionHeading } from './SectionHeading';
import { formatTime12h } from '../utils/time';
import { specialtyPillStyle, getSpecialtyColor } from '../utils/specialty';
import { staggerListVariants, cardItemVariants, EASE_OUT } from '../utils/motion';

const PILL_SPRING = { type: 'spring', stiffness: 460, damping: 36 };

export function SpeakersView({
  speakers,
  scheduleById,
  conference,
  onSelectSpeaker,
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const specialties = useMemo(
    () => ['All', ...new Set(speakers.map((s) => s.specialty).filter(Boolean))],
    [speakers]
  );

  const filteredSpeakers = useMemo(() => {
    if (selectedSpecialty === 'All') return speakers;
    return speakers.filter((s) => s.specialty === selectedSpecialty);
  }, [speakers, selectedSpecialty]);

  return (
    <div className="space-y-6">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow="Scientific Faculty"
        title="Distinguished Speakers"
        description={`${speakers.length} keynote & specialty lecturers across ${specialties.length - 1} dental disciplines.`}
        aside={
          <span className="inline-flex rounded-full border border-slate-200/70 bg-white px-3.5 py-1.5 font-display text-xs font-semibold text-[#086958] shadow-xs tabular-nums">
            {filteredSpeakers.length}{' '}
            {filteredSpeakers.length === 1 ? 'Speaker' : 'Speakers'}
          </span>
        }
      />

      {/* Horizontal Scrollable Glass Specialty Filter Bar */}
      <LayoutGroup id="speaker-specialties">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-xs backdrop-blur-md">
          {specialties.map((specialty) => {
            const active = selectedSpecialty === specialty;
            return (
              <motion.button
                key={specialty}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 font-display text-xs font-semibold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-[#64748B] hover:text-[#0D224C]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="speakerSpecialtyPill"
                    transition={PILL_SPRING}
                    className="absolute inset-0 rounded-full bg-[#0D224C] shadow-sm"
                    aria-hidden="true"
                  />
                )}
                {specialty !== 'All' && (
                  <span
                    className="relative z-10 h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: active ? '#3AB498' : getSpecialtyColor(specialty),
                    }}
                  />
                )}
                <span className="relative z-10">{specialty}</span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Responsive Staggered Speaker Grid */}
      <motion.div
        key={selectedSpecialty}
        variants={staggerListVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredSpeakers.map((speaker) => {
          const session = scheduleById[speaker.sessionId];
          const dayInfo = conference.days.find((d) => d.id === session?.day);
          const isPrincess = session?.hall === 'princess';

          return (
            <motion.article
              key={speaker.id}
              variants={cardItemVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              onClick={() => onSelectSpeaker(speaker)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectSpeaker(speaker);
                }
              }}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-[#3AB498]/40 hover:shadow-cardHover cursor-pointer"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <SpeakerAvatar
                    photo={speaker.photo}
                    name={speaker.name}
                    initials={speaker.initials}
                    avatarTone={speaker.avatarTone}
                    size="md"
                    zoomOnHover
                  />

                  <div className="min-w-0 flex-1">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 font-display text-[10px] font-semibold"
                      style={specialtyPillStyle(speaker.specialty)}
                    >
                      {speaker.specialty}
                    </span>
                    <h2 className="mt-1.5 font-display text-[15px] font-bold leading-snug tracking-tight text-[#0B192C] transition-colors group-hover:text-[#0D224C]">
                      {speaker.name}
                    </h2>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#64748B] line-clamp-2">
                      {speaker.title}
                    </p>
                  </div>
                </div>

                {session && (
                  <p className="mt-4 text-[13px] font-medium leading-relaxed text-[#0B192C]/90 line-clamp-2">
                    {session.title}
                  </p>
                )}
              </div>

              {session && (
                <div className="mt-4 pt-3.5 border-t border-slate-200/70 flex items-center justify-between gap-2 text-[11px] text-[#64748B]">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 min-w-0">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0B192C]">
                      <Calendar className="h-3 w-3 text-[#64748B]" />
                      {dayInfo?.shortLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="h-3 w-3 text-[#64748B]" />
                      {formatTime12h(session.startTime)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPrincess ? 'bg-[#0D224C]' : 'bg-[#086958]'
                        }`}
                      />
                      {isPrincess ? 'Princess' : 'Al Diwan'}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#086958]" />
                </div>
              )}
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
