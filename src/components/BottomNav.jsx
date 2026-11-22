import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const DOCK_SPRING = { type: 'spring', stiffness: 420, damping: 32 };

export function BottomNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden max-w-[calc(100vw-1.5rem)]"
    >
      <LayoutGroup id="floating-dock">
        <div className="flex items-center gap-1 min-[375px]:gap-1.5 p-1.5 rounded-full bg-[#091938]/90 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(7,20,46,0.45)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const label = tab.mobileLabel || tab.label;

            return (
              <motion.button
                key={tab.id}
                layout
                type="button"
                whileTap={{ scale: 0.95 }}
                transition={DOCK_SPRING}
                onClick={() => {
                  onTabChange(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AB498] ${
                  isActive
                    ? 'px-3.5 min-[375px]:px-4 py-2.5 text-[#07142E]'
                    : 'h-11 w-11 text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="dockActivePill"
                    transition={DOCK_SPRING}
                    className="absolute inset-0 rounded-full bg-[#3AB498] shadow-[0_4px_18px_rgba(58,180,152,0.4)]"
                    aria-hidden="true"
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-[19px] w-[19px] shrink-0" />
                  <AnimatePresence initial={false} mode="popLayout">
                    {isActive && (
                      <motion.span
                        key={`${tab.id}-label`}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden whitespace-nowrap font-display text-xs font-semibold leading-none tracking-tight"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
