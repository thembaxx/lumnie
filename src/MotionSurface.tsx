'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';

/**
 * Intent-based transitions shared by the learning app. Motion is a progressive
 * enhancement: the content and controls never depend on an animation finishing.
 */
export type MotionIntent = 'page' | 'step' | 'backdrop' | 'dialog' | 'toast';
type MotionPreset = Pick<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'transition'>;

export function getMotionPreset(intent: MotionIntent, reducedMotion: boolean): MotionPreset {
  if (reducedMotion) {
    return {
      initial: false,
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    };
  }

  switch (intent) {
    case 'page':
      return {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.24, ease: 'easeOut' },
      };
    case 'step':
      return {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.2, ease: 'easeOut' },
      };
    case 'backdrop':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.16 },
      };
    case 'dialog':
      return {
        initial: { opacity: 0, y: 24, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
        transition: { type: 'spring', damping: 29, stiffness: 350 },
      };
    case 'toast':
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: { duration: 0.2, ease: 'easeOut' },
      };
  }
}

type MotionSurfaceProps = Omit<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
> & {
  intent: MotionIntent;
};

export const MotionSurface = forwardRef<HTMLDivElement, MotionSurfaceProps>(function MotionSurface(
  { intent, ...props },
  ref,
) {
  const reducedMotion = Boolean(useReducedMotion());
  return (
    <motion.div
      {...props}
      {...getMotionPreset(intent, reducedMotion)}
      data-motion-intent={intent}
      data-motion-reduced={reducedMotion ? 'true' : 'false'}
      ref={ref}
    />
  );
});
