import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Calendar, Clock, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { SpeakerAvatar } from './SpeakerAvatar';
import { WhatsAppIcon } from './WhatsAppIcon';
import { formatTimeRange, buildWhatsAppUrl } from '../utils/time';
import { drawerSpring } from '../utils/motion';

export function DetailDrawer({
  item,
  conference,
  isSaved,
  onToggleSave,
  onClose,
}) {
  useEffect(() => {
    if (!item) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  const isWorkshop = Boolean(item?.workshop);
  const workshop = item?.workshop || null;
  const session = item?.session || null;
  const speaker = item?.speaker || null;

  const hallInfo = session?.hall ? conference.halls[session.hall] : null;
  const dayInfo = conference.days.find((d) => d.id === session?.day);
  const saved = session ? isSaved(session.id) : false;

  const workshopReserveUrl = workshop
    ? buildWhatsAppUrl(
        conference.whatsapp.number,
        `Hello, I would like to reserve a seat for the workshop "${workshop.title}" (${workshop.fee}) at DDSC 2026.`
      )
    : '';

  return (
    <AnimatePresence>
      {item && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0B192C]/50 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Spring Drawer / Modal Panel */}
          <motion.div
            initial={{ opacity: 0, y: 42, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={drawerSpring}
            className="relative z-10 w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-[#0D224C]/[0.08]"
          >
            {/* Mobile grab indicator */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-[#0D224C]/15" />
            </div>

            {/* WORKSHOP DETAIL MODE */}
            {isWorkshop && workshop ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#3AB498]/15 px-2.5 py-0.5 font-display text-[11px] font-semibold text-[#086958]">
                        <Sparkles className="h-3 w-3" />
                        {workshop.specialty}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#3AB498]/15 px-2.5 py-0.5 font-display text-[10px] font-semibold text-[#086958]">
                        Limited Capacity
                      </span>
                    </div>
                    <h2
                      id="drawer-title"
                      className="font-display text-lg font-bold leading-snug text-[#0D224C]"
                    >
                      {workshop.title}
                    </h2>
                    <p className="mt-1 text-xs font-medium text-[#64748B]">
                      {workshop.instructor} · {workshop.instructorTitle}
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F7F9] text-[#64748B] hover:bg-[#0D224C]/10 hover:text-[#0B192C] transition-colors"
                    aria-label="Close workshop details"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Workshop Meta Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl bg-[#F4F7F9] p-3.5 border border-[#0D224C]/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D224C] shadow-xs">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B]">Date</p>
                      <p className="font-display text-xs font-semibold text-[#0B192C]">
                        {workshop.date || workshop.dayLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#086958] shadow-xs">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B]">Time</p>
                      <p className="font-display text-xs font-semibold text-[#0B192C]">
                        {workshop.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:col-span-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#086958] text-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-[#64748B]">Training Room</p>
                        <p className="font-display text-xs font-semibold text-[#0B192C]">
                          {workshop.room}
                        </p>
                      </div>
                      <span className="rounded-lg bg-white px-2.5 py-1 font-display text-xs font-bold text-[#0D224C] border border-[#0D224C]/[0.08]">
                        {workshop.fee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Highlights List */}
                <div className="mt-5">
                  <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    What You Will Practice
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {workshop.highlights.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-[#475569]"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3AB498]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary WhatsApp Reserve CTA */}
                <div className="mt-6 pb-safe">
                  <motion.a
                    href={workshopReserveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.97 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#086958] px-4 py-3 font-display text-sm font-semibold text-white shadow-sm hover:bg-[#065749] transition-colors"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    <span>Reserve Seat via WhatsApp ({workshop.fee})</span>
                  </motion.a>
                </div>
              </div>
            ) : (
              /* SPEAKER & SESSION DETAIL MODE */
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {speaker && (
                      <SpeakerAvatar
                        photo={speaker.photo}
                        name={speaker.name}
                        initials={speaker.initials}
                        avatarTone={speaker.avatarTone}
                        size="lg"
                        zoomOnHover={false}
                      />
                    )}
                    <div className="min-w-0">
                      {(speaker?.specialty || session?.specialty) && (
                        <span className="inline-block rounded-full bg-[#3AB498]/15 px-2.5 py-0.5 font-display text-[11px] font-semibold text-[#086958] mb-1">
                          {speaker?.specialty || session?.specialty}
                        </span>
                      )}
                      <h2
                        id="drawer-title"
                        className="font-display text-base sm:text-lg font-bold text-[#0B192C] leading-snug"
                      >
                        {speaker?.name || session?.speakerName}
                      </h2>
                      {speaker?.title && (
                        <p className="text-xs text-[#64748B] leading-snug mt-0.5">
                          {speaker.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4F7F9] text-[#64748B] hover:bg-[#0D224C]/10 hover:text-[#0B192C] transition-colors"
                    aria-label="Close details"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                {session && (
                  <div className="mt-5">
                    <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      Scientific Lecture
                    </p>
                    <h3 className="mt-1.5 font-display text-base sm:text-[17px] font-bold leading-snug text-[#0D224C]">
                      {session.title}
                    </h3>
                    {session.abstract && (
                      <p className="mt-2.5 text-sm leading-relaxed text-[#475569]">
                        {session.abstract}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl bg-[#F4F7F9] p-3.5 border border-[#0D224C]/[0.06]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#0D224C] shadow-xs">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748B]">Date</p>
                          <p className="font-display text-xs font-semibold text-[#0B192C]">
                            {dayInfo?.fullLabel || session.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#086958] shadow-xs">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11px] text-[#64748B]">Time (Cairo)</p>
                          <p className="font-display text-xs font-semibold text-[#0B192C]">
                            {formatTimeRange(session.startTime, session.endTime)}
                          </p>
                        </div>
                      </div>

                      {hallInfo && (
                        <div className="flex items-center gap-2.5 sm:col-span-2">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
                            style={{ backgroundColor: hallInfo.accent }}
                          >
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] text-[#64748B]">Conference Hall</p>
                            <p className="font-display text-xs font-semibold text-[#0B192C]">
                              {hallInfo.name}{' '}
                              <span className="font-sans font-normal text-[#64748B]">
                                · {hallInfo.floor}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(Array.isArray(speaker?.credentials) && speaker.credentials.length > 0) ||
                speaker?.bio ? (
                  <div className="mt-4 pt-4 border-t border-[#0D224C]/[0.07]">
                    <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      Academic Credentials &amp; Affiliations
                    </p>
                    {Array.isArray(speaker?.credentials) &&
                    speaker.credentials.length > 0 ? (
                      <ul className="mt-2 space-y-1.5">
                        {speaker.credentials.map((cred) => (
                          <li
                            key={cred}
                            className="flex items-start gap-2 text-sm leading-snug text-[#475569]"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3AB498]" />
                            <span>{cred}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1.5 text-sm leading-relaxed text-[#475569]">
                        {speaker.bio}
                      </p>
                    )}
                  </div>
                ) : null}

                {session && (
                  <div className="mt-6 flex items-center gap-2.5 pb-safe">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onToggleSave(session.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-sm font-semibold transition-colors duration-200 ${
                        saved
                          ? 'bg-[#3AB498]/15 text-[#086958] border border-[#3AB498]/35 hover:bg-[#3AB498]/20'
                          : 'bg-[#0D224C] text-white shadow-sm hover:bg-[#14326B]'
                      }`}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        fill={saved ? 'currentColor' : 'none'}
                      />
                      <span>{saved ? 'Saved in My Schedule' : 'Save to My Schedule'}</span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
