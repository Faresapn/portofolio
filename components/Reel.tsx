'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { hue, profile, reel } from '@/lib/content';
import { lockScroll, prefersReducedMotion } from '@/lib/scroll';
import s from './Reel.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Reel() {
  const loops = useRef<(HTMLVideoElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  // Muted loops play only while their card is on screen.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      (items) =>
        items.forEach((item) => {
          const v = item.target as HTMLVideoElement;
          if (item.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.5 },
    );
    loops.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);

  const show = (i: number, from: HTMLElement) => {
    trigger.current = from;
    loops.current.forEach((v) => v?.pause());
    setOpen(i);
  };

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <section
      id="reel"
      className={`${s.reel} ground-ink`}
      data-chapter="AI Video"
      data-tone="dark"
      aria-labelledby="reel-title"
      style={{ ['--em' as string]: 'var(--rose)' }}
    >
      <header className="sec-head">
        <p className="sec-index label">
          <span>04 — AI Video</span>
          <span>Selected cuts · 2026</span>
        </p>
        <h2 id="reel-title" className="sec-title" data-split>
          AI <em>video</em> reel
        </h2>
        <p className="sec-note" data-reveal>
          Short vertical videos I direct and generate with the newest video models: ads, property promos, explainers
          and character series. Tap any clip to watch it with sound.
        </p>
      </header>

      <ol className={`${s.grid} wrap`}>
        {reel.map((c, i) => (
          <li key={c.slug} className={s.item} style={hue(c.hue)} data-reveal>
            <button
              type="button"
              className={s.card}
              onClick={(e) => show(i, e.currentTarget)}
              aria-label={`Watch ${c.title}, ${c.kind}, made with ${c.model}`}
            >
              <span className={s.frame}>
                <video
                  ref={(el) => {
                    loops.current[i] = el;
                  }}
                  src={`/reel/${c.slug}-loop.mp4`}
                  poster={`/reel/${c.slug}.webp`}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
                <span className={`label ${s.top}`}>
                  <span>{pad(i + 1)}</span>
                  <span>{c.length}</span>
                </span>
                <span className={s.play} aria-hidden>
                  ▶
                </span>
              </span>
              <span className={s.kind}>{c.kind}</span>
              <span className={s.title}>{c.title}</span>
              <span className={`label ${s.model}`}>{c.model}</span>
            </button>
          </li>
        ))}
        <li className={s.hire} data-reveal>
          <p className="label">Freelance</p>
          <p className={s.hireTitle}>Need videos like these?</p>
          <p className={s.hireBody}>
            Product ads, property promos, explainers or a recurring AI character for your brand. Vertical, on brief and
            ready to post.
          </p>
          <a className={s.hireBtn} href={`mailto:${profile.email}?subject=AI%20video%20project`}>
            Start a video project <span aria-hidden>→</span>
          </a>
        </li>
      </ol>

      {open !== null && <Player index={open} onChange={setOpen} onClose={close} />}
    </section>
  );
}

function Player({ index, onChange, onClose }: { index: number; onChange: (i: number) => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const clip = reel[index];
  const go = useCallback((d: number) => onChange((index + d + reel.length) % reel.length), [index, onChange]);

  useEffect(() => {
    setMounted(true);
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  useEffect(() => {
    if (mounted) closeRef.current?.focus({ preventScroll: true });
  }, [mounted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && roomRef.current) {
        const items = Array.from(roomRef.current.querySelectorAll<HTMLElement>('button, video[controls]'));
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={roomRef}
      className={s.room}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reel-player-title"
      data-lenis-prevent
      style={hue(clip.hue)}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={s.stage}>
        <video
          key={clip.slug}
          className={s.full}
          src={`/reel/${clip.slug}.mp4`}
          poster={`/reel/${clip.slug}.webp`}
          controls
          autoPlay
          playsInline
        />
      </div>
      <aside className={s.info}>
        <p className="label">
          {pad(index + 1)} / {pad(reel.length)} · {clip.length}
        </p>
        <h3 id="reel-player-title" className={s.infoTitle}>
          {clip.title}
        </h3>
        <p className={s.infoKind}>{clip.kind}</p>
        <p className={s.infoModel}>
          <span className="label">Made with</span>
          {clip.model}
        </p>
        <div className={s.nav}>
          <button type="button" onClick={() => go(-1)} aria-label="Previous video">
            ← Prev
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next video">
            Next →
          </button>
        </div>
        <button ref={closeRef} type="button" className={s.close} onClick={onClose}>
          Close <kbd>Esc</kbd>
        </button>
      </aside>
    </div>,
    document.body,
  );
}
