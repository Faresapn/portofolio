import type Lenis from 'lenis';

// One Lenis instance for the whole page. Components subscribe instead of
// importing it directly so they work before (and without) smooth scroll.

let instance: Lenis | null = null;
const subscribers = new Set<(lenis: Lenis | null) => void>();

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
  subscribers.forEach((fn) => fn(lenis));
}

export function getLenis() {
  return instance;
}

export function onLenis(fn: (lenis: Lenis | null) => void) {
  subscribers.add(fn);
  fn(instance);
  return () => {
    subscribers.delete(fn);
  };
}

export function scrollToTarget(
  target: number | string | HTMLElement,
  opts: { offset?: number; immediate?: boolean; duration?: number } = {},
) {
  if (instance) {
    instance.scrollTo(target, {
      offset: opts.offset ?? 0,
      immediate: opts.immediate,
      duration: opts.duration,
      force: true,
    });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  const y =
    typeof el === 'number'
      ? el
      : el
        ? el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0)
        : 0;
  window.scrollTo({ top: y, behavior: opts.immediate ? 'auto' : 'smooth' });
}

export function lockScroll(locked: boolean) {
  if (instance) {
    if (locked) instance.stop();
    else instance.start();
  }
  document.documentElement.classList.toggle('is-locked', locked);
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
