export const EASE_OUT = [0.22, 1, 0.36, 1];

export const tabTransitionVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};

export const staggerListVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const cardItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASE_OUT,
    },
  },
};

export const drawerSpring = {
  type: 'spring',
  damping: 30,
  stiffness: 340,
  mass: 0.85,
};

export const lightboxZoomVariants = {
  initial: { opacity: 0, scale: 0.93 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 28, stiffness: 320 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};
