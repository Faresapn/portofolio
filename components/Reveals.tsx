'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { prefersReducedMotion } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Scroll-in reveals for the whole page, set up in one place:
 * [data-split]  → headline lines rise out of a mask
 * [data-reveal] → blocks fade up once, in batches
 */
export default function Reveals() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1.15,
              ease: 'expo.out',
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }),
        });
      });

      gsap.set('[data-reveal]', { opacity: 0, y: 28 });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
