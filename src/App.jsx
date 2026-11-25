import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { Home, CalendarDays, GraduationCap, Users, Store, MapPin } from 'lucide-react';

import conferenceData from './data/conference.json';
import scheduleData from './data/schedule.json';
import workshopsData from './data/workshops.json';
import speakersData from './data/speakers.json';
import exhibitorsData from './data/exhibitors.json';
import postersData from './data/posters.json';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { IntroSplash, shouldPlayIntro } from './components/IntroSplash';
import { HomeView } from './components/HomeView';
import { ScheduleView } from './components/ScheduleView';
import { WorkshopsView } from './components/WorkshopsView';
import { SpeakersView } from './components/SpeakersView';
import { ExhibitorsView } from './components/ExhibitorsView';
import { VenueView } from './components/VenueView';
import { DetailDrawer } from './components/DetailDrawer';

import { useSavedSessions } from './hooks/useSavedSessions';
import {
  PREVIEW_PRESETS,
  getLiveConferenceState,
  isLivePreviewAllowed,
  buildWhatsAppUrl,
} from './utils/time';
import { tabTransitionVariants } from './utils/motion';

const DESKTOP_TABS = [
  { id: 'home', label: 'Home', mobileLabel: 'Home', icon: Home },
  { id: 'schedule', label: 'Schedule', mobileLabel: 'Schedule', icon: CalendarDays },
  { id: 'workshops', label: 'Workshops', mobileLabel: 'Workshops', icon: GraduationCap },
  { id: 'speakers', label: 'Speakers', mobileLabel: 'Speakers', icon: Users },
  { id: 'exhibitors', label: 'Exhibitors', mobileLabel: 'Exhibitors', icon: Store },
  { id: 'venue', label: 'Venue', mobileLabel: 'Venue', icon: MapPin },
];

const MOBILE_TABS = DESKTOP_TABS.filter((t) => t.id !== 'exhibitors');

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [realNowMs, setRealNowMs] = useState(() => Date.now());
  const [previewPresetId, setPreviewPresetId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showIntro, setShowIntro] = useState(() => shouldPlayIntro());
  const headerLogoRef = useRef(null);

  const { savedIds, toggleSave, isSaved } = useSavedSessions();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRealNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduleById = useMemo(
    () => Object.fromEntries(scheduleData.map((s) => [s.id, s])),
    []
  );

  const speakersById = useMemo(
    () => Object.fromEntries(speakersData.map((s) => [s.id, s])),
    []
  );

  const canPreviewLive = isLivePreviewAllowed(realNowMs);

  useEffect(() => {
    if (!canPreviewLive && previewPresetId) {
      setPreviewPresetId(null);
    }
  }, [canPreviewLive, previewPresetId]);

  const effectiveNowMs = useMemo(() => {
    if (!canPreviewLive || !previewPresetId) return realNowMs;
    const preset = PREVIEW_PRESETS.find((p) => p.id === previewPresetId);
    return preset ? Date.parse(preset.iso) : realNowMs;
  }, [canPreviewLive, previewPresetId, realNowMs]);

  const liveState = useMemo(
    () => getLiveConferenceState(effectiveNowMs, scheduleData, conferenceData),
    [effectiveNowMs]
  );

  const bookingUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        conferenceData.whatsapp.number,
        conferenceData.whatsapp.bookingMessage
      ),
    []
  );

  const supportUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        conferenceData.whatsapp.number,
        conferenceData.whatsapp.supportMessage
      ),
    []
  );

  const handleNavigate = useCallback((tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTogglePreview = useCallback(() => {
    if (!isLivePreviewAllowed(Date.now())) {
      setPreviewPresetId(null);
      return;
    }
    setPreviewPresetId((prev) => (prev ? null : PREVIEW_PRESETS[0].id));
  }, []);

  const handleSelectSession = useCallback(
    (session) => {
      if (!session || session.type !== 'session') return;
      const speaker = session.speakerId ? speakersById[session.speakerId] : null;
      setSelectedDetail({ session, speaker });
    },
    [speakersById]
  );

  const handleSelectSpeaker = useCallback(
    (speaker) => {
      if (!speaker) return;
      const session = speaker.sessionId ? scheduleById[speaker.sessionId] : null;
      setSelectedDetail({ session, speaker });
    },
    [scheduleById]
  );

  const handleSelectWorkshop = useCallback((workshop) => {
    if (!workshop) return;
    setSelectedDetail({ workshop });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col overflow-x-clip bg-[#F3F6FA] text-[#0B192C]">
        {/* Signature Splash-to-Header Intro Animation (once per session) */}
        {showIntro && (
          <IntroSplash
            targetRef={headerLogoRef}
            onComplete={() => setShowIntro(false)}
          />
        )}

        {/* Floating Minimal Header */}
        <Header
          tabs={DESKTOP_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          bookingUrl={bookingUrl}
          logoRef={headerLogoRef}
          logoHidden={showIntro}
        />

        {/* Main Content Area with Smooth Tab Transitions */}
        <main className="w-full flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              variants={tabTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTab === 'home' ? (
                <HomeView
                  conference={conferenceData}
                  workshops={workshopsData}
                  bookingUrl={bookingUrl}
                  supportUrl={supportUrl}
                  onNavigate={handleNavigate}
                  onSelectWorkshop={handleSelectWorkshop}
                  liveState={liveState}
                />
              ) : (
                <div className="mx-auto w-full max-w-5xl px-4 pt-20 pb-4 sm:px-6 sm:pt-22">
                  {activeTab === 'schedule' && (
                    <ScheduleView
                      schedule={scheduleData}
                      posters={postersData}
                      conference={conferenceData}
                      liveState={liveState}
                      nowMs={effectiveNowMs}
                      previewPresetId={canPreviewLive ? previewPresetId : null}
                      canPreviewLive={canPreviewLive}
                      onTogglePreview={handleTogglePreview}
                      onSelectPreset={setPreviewPresetId}
                      savedIds={savedIds}
                      isSaved={isSaved}
                      onToggleSave={toggleSave}
                      onSelectSession={handleSelectSession}
                      speakersById={speakersById}
                    />
                  )}

                  {activeTab === 'workshops' && (
                    <WorkshopsView
                      workshops={workshopsData}
                      conference={conferenceData}
                      onSelectWorkshop={handleSelectWorkshop}
                    />
                  )}

                  {activeTab === 'speakers' && (
                    <SpeakersView
                      speakers={speakersData}
                      scheduleById={scheduleById}
                      conference={conferenceData}
                      onSelectSpeaker={handleSelectSpeaker}
                    />
                  )}

                  {activeTab === 'exhibitors' && (
                    <ExhibitorsView exhibitors={exhibitorsData} />
                  )}

                  {activeTab === 'venue' && (
                    <VenueView
                      conference={conferenceData}
                      bookingUrl={bookingUrl}
                      supportUrl={supportUrl}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Upgraded Animated Footer */}
        <Footer
          tabs={DESKTOP_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          conference={conferenceData}
          bookingUrl={bookingUrl}
          supportUrl={supportUrl}
        />

        {/* Mobile Glassmorphic 5-Tab Bottom Navigation */}
        <BottomNav
          tabs={MOBILE_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Spring-Animated Speaker / Session / Workshop Detail Drawer */}
        <DetailDrawer
          item={selectedDetail}
          conference={conferenceData}
          isSaved={isSaved}
          onToggleSave={toggleSave}
          onClose={() => setSelectedDetail(null)}
        />
      </div>
    </MotionConfig>
  );
}
