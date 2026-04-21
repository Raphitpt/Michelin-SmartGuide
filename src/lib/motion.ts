// src/lib/motion.ts
import type { Variants } from 'framer-motion'

export const pageTransition: Variants = {
  initial: { x: 24, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit:    { x: -24, opacity: 0 },
}

export const pageTransitionConfig = {
  duration: 0.22,
  ease: 'easeInOut' as const,
}

export const fadeSlideUp: Variants = {
  hidden:  { y: 16, opacity: 0 },
  visible: { y: 0,  opacity: 1 },
}

export const fadeSlideUpCard: Variants = {
  hidden:  { y: 20, opacity: 0 },
  visible: { y: 0,  opacity: 1 },
}

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
}

export const staggerContainerDetail: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export const slideImageVariants: Variants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 1 }),
  center: { x: 0, opacity: 1 },
  exit:  (direction: number) => ({ x: direction > 0 ? '-100%' : '100%', opacity: 1 }),
}

export const slideImageTransition = {
  duration: 0.25,
  ease: 'easeInOut' as const,
}
