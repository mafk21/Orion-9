export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } }
};

export const glowButtonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut', delay: 0.1 } }
};

export const staggerChildren = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } }
};
