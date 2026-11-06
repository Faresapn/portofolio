'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hue, profile, type Hue } from '@/lib/content';
import { prefersReducedMotion } from '@/lib/scroll';
import s from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

const BASE = 500;
const PEAK = 900;
const LETTER_HUES: Hue[] = ['amber', 'rose', 'teal', 'blue', 'violet', 'green'];
// A strip of colour bars, like the test pattern at the head of a reel.
const BARS: Hue[] = ['signal', 'amber', 'green', 'teal', 'blue', 'violet', 'rose'];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  // Intro: letters rise out of the frame, then the chrome fades in.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>('[data-letter]');
      const rest = gsap.utils.toArray<HTMLElement>('[data-intro]:not([data-letter])');
      gsap.set(letters, { opacity: 1 });
      gsap
        .timeline({ delay: 0.1 })
        .from(letters, { yPercent: 108, duration: 1.3, ease: 'expo.out', stagger: 0.065 })
        .from(`.${s.bars} i`, { scaleX: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }, 0.35)
        .to(rest, { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.05 }, 0.55);

      gsap.to(`.${s.nameInner}`, {
        yPercent: -16,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    });
    return () => ctx.revert();
  }, []);

  // Letters thicken near the pointer, and a weight wave rolls through them as
  // the title scrolls away (the only cue touch screens get).
  useEffect(() => {
    const name = nameRef.current;
    const hero = heroRef.current;
    if (!name || !hero || prefersReducedMotion()) return;

    const letters = Array.from(name.querySelectorAll<HTMLElement>('[data-weight]'));
    const current = letters.map(() => BASE);
    let centers: number[] = [];
    let px = -1e4;
    let py = -1e4;
    let pointer = false;
    let wave = -4;
    let visible = true;
    let raf = 0;

    const measure = () => {
      const box = name.getBoundingClientRect();
      centers = letters.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left - box.left + r.width / 2;
      });
    };

    const loop = () => {
      raf = 0;
      if (!visible) return;
      const box = name.getBoundingClientRect();
      const radius = Math.max(200, box.width * 0.26);
      const midY = box.top + box.height / 2;

      letters.forEach((el, i) => {
        let pull = 0;
        if (pointer) {
          const d = Math.hypot(px - (box.left + centers[i]), (py - midY) * 0.55);
          const t = Math.max(0, 1 - d / radius);
          pull = t * t * (3 - 2 * t);
        }
        const dw = i - wave;
        pull = Math.max(pull, Math.exp(-(dw * dw) / 1.1));
        const target = BASE + (PEAK - BASE) * pull;
        const next = current[i] + (target - current[i]) * 0.13;
        if (Math.abs(next - current[i]) > 0.25) {
          current[i] = next;
          el.style.fontWeight = next.toFixed(1);
          // Heavier letters also take on their own colour.
          el.style.setProperty('--pull', ((next - BASE) / (PEAK - BASE)).toFixed(3));
        }
      });
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      pointer = true;
    };
    const onLeave = () => {
      pointer = false;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(name);
    document.fonts?.ready.then(measure);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    const st = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        wave = -1.5 + self.progress * (letters.length + 3);
      },
    });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(name);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      st.kill();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="top"
      className={`${s.hero} ground-ink`}
      data-chapter="Intro"
      data-tone="dark"
      aria-labelledby="hero-name"
    >
      <div className={s.corners} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className={s.top}>
        <span className="label" data-intro>
          Portfolio — 2026
        </span>
        <span className="label" data-intro>
          {profile.role}
        </span>
        <span className="label" data-intro>
          {profile.city}
        </span>
      </div>

      <h1 id="hero-name" ref={nameRef} className={s.name} aria-label={`${profile.name}, ${profile.role}`}>
        <span className={s.nameInner} aria-hidden>
          {profile.first.split('').map((ch, i) => (
            <span key={i} className={s.cell}>
              <span className={s.letter} style={hue(LETTER_HUES[i])} data-letter data-intro data-weight>
                {ch}
              </span>
            </span>
          ))}
        </span>
      </h1>

      <div className={s.bars} aria-hidden>
        {BARS.map((b) => (
          <i key={b} style={hue(b)} />
        ))}
      </div>

      <div className={s.foot}>
        <p className={s.who} data-intro>
          <span className={s.full}>{profile.name}</span>
          <span className="label">Software engineer · 1 year</span>
        </p>
        <p className={s.statement} data-intro>
          I build AI agents that work on their own, AI videos that sell, and websites that <span>come alive</span> as you scroll.
        </p>
        <div className={s.meta} data-intro>
          <span className="label">Currently</span>
          <span className={s.current}>{profile.current}</span>
          <span className={`label ${s.cue}`}>
            Scroll to explore <span aria-hidden>↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
