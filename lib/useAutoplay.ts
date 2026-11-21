'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './scroll';

/** Plays a muted preview only while it is on screen (never with reduced motion). */
export function useAutoplay<T extends HTMLVideoElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
