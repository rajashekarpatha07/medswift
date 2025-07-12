export const headingVariants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, type: 'spring' } },
  hover: { scale: 1.05, transition: { duration: 0.3, type: 'spring' } },
  tap: { scale: 0.95 },
};
