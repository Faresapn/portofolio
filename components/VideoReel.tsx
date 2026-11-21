'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { profile, reel } from '@/lib/content';
import { lockScroll } from '@/lib/scroll';
import SceneHead from './SceneHead';
import s from './VideoReel.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

export default function VideoReel() {
  const [open, setOpen] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <section id="reel" className="section" aria-labelledby="reel-title">
      <SceneHead id="reel" title="AI videos for ads, products and stories.">
        Short vertical videos I direct and generate with current AI video models: ads, property promos, explainers and
        character series. Tap a clip to watch it with sound.
      </SceneHead>

      <ol className={`wrap ${s.grid}`}>
        {reel.map((c, i) => (
          <li key={c.slug}>
            <button
              type="button"
              className={s.card}
              onClick={(e) => {
                trigger.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`Watch ${c.title}, ${c.kind}, made with ${c.model}`}
            >
              <span className={s.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/reel/${c.slug}.webp`} alt="" loading="lazy" decoding="async" />
                <span className={s.length}>{c.length}</span>
                <span className={s.play} aria-hidden>
                  ▶
                </span>
              </span>
              <span className={s.title}>{c.title}</span>
              <span className={s.meta}>
                {c.kind} · {c.model}
              </span>
            </button>
          </li>
        ))}
        <li className={s.hire}>
          <p className={s.hireTitle}>Need videos like these?</p>
          <p className={s.hireBody}>
            Product ads, property promos, explainers or a recurring AI character for your brand. Vertical, on brief and
            ready to post.
          </p>
          <a className="btn btn-primary" href={`mailto:${profile.email}?subject=AI%20video%20project`}>
            Start a video project
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
        <p className={s.count}>
          {pad(index + 1)} of {pad(reel.length)} · {clip.length}
        </p>
        <h3 id="reel-player-title" className={s.infoTitle}>
          {clip.title}
        </h3>
        <p className={s.infoKind}>{clip.kind}</p>
        <p className={s.infoModel}>
          <span>Made with</span>
          {clip.model}
        </p>
        <div className={s.nav}>
          <button type="button" onClick={() => go(-1)} aria-label="Previous video">
            ← Previous
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
