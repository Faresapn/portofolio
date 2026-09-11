'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import type { Build, Project } from '@/lib/content';
import { lockScroll, prefersReducedMotion } from '@/lib/scroll';
import { timecode } from '@/lib/timecode';
import s from './ScreeningRoom.module.css';

const DEVICES = {
  desktop: { label: 'Desktop', w: 1440, h: 900 },
  tablet: { label: 'Tablet', w: 820, h: 1180 },
  mobile: { label: 'Mobile', w: 390, h: 844 },
} as const;
type Device = keyof typeof DEVICES;

type Props = {
  project: Project;
  number: string;
  build: Build;
  origin: DOMRect | null;
  onClose: () => void;
};

const insetFrom = (r: DOMRect) =>
  `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px)`;

export default function ScreeningRoom({ project, number, build, origin, onClose }: Props) {
  const roomRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const closing = useRef(false);

  const [device, setDevice] = useState<Device>('desktop');
  const [scale, setScale] = useState(0.5);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  const dev = DEVICES[device];
  const host = build.url.replace(/^https?:\/\//, '');

  useEffect(() => {
    setMounted(true);
    if (window.innerWidth < 720) setDevice('mobile');
    else if (window.innerWidth < 1100) setDevice('tablet');
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  // Open from the monitor's rectangle, like cutting to a full-frame shot.
  useLayoutEffect(() => {
    const room = roomRef.current;
    if (!room || !mounted) return;
    closeRef.current?.focus({ preventScroll: true });
    if (prefersReducedMotion() || !origin) {
      gsap.fromTo(room, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      return;
    }
    gsap.fromTo(
      room,
      { clipPath: insetFrom(origin) },
      { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.8, ease: 'expo.inOut' },
    );
  }, [mounted, origin]);

  const close = () => {
    const room = roomRef.current;
    if (closing.current) return;
    closing.current = true;
    if (!room || prefersReducedMotion() || !origin) {
      gsap.to(room, { opacity: 0, duration: 0.2, onComplete: onClose });
      return;
    }
    gsap.to(room, { clipPath: insetFrom(origin), duration: 0.55, ease: 'expo.inOut', onComplete: onClose });
  };

  // Fit the chosen viewport into whatever space the stage has.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const pad = window.innerWidth < 720 ? 16 : 48;
      const sw = stage.clientWidth - pad;
      const sh = stage.clientHeight - pad;
      setScale(Math.min(sw / dev.w, sh / dev.h, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [dev.w, dev.h, mounted]);

  // A timecode that runs while the live site loads.
  useEffect(() => {
    if (loaded || !build.embeddable) return;
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      if (countRef.current) countRef.current.textContent = timecode(((performance.now() - start) / 1000) * 24);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [loaded, build.embeddable, reloadKey, device]);

  // Esc closes; Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
      if (e.key !== 'Tab' || !roomRef.current) return;
      const items = Array.from(
        roomRef.current.querySelectorAll<HTMLElement>('button, a[href], iframe, video[controls]'),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={roomRef}
      className={s.room}
      role="dialog"
      aria-modal="true"
      aria-labelledby="screening-title"
      data-lenis-prevent
    >
      <div className={s.bar}>
        <div className={s.id}>
          <span className="label">Live preview — {number}</span>
          <h2 id="screening-title" className={s.title}>
            {project.title}
            {project.builds.length > 1 && <span className={s.buildName}> {build.label}</span>}
          </h2>
        </div>

        {build.embeddable && (
          <div className={s.devices} role="group" aria-label="Viewport size">
            {(Object.keys(DEVICES) as Device[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={device === key}
                onClick={() => {
                  if (device === key) return;
                  setLoaded(false);
                  setDevice(key);
                }}
              >
                {DEVICES[key].label}
                <span className={s.dims}>
                  {DEVICES[key].w}×{DEVICES[key].h}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className={s.actions}>
          {build.embeddable && (
            <button
              type="button"
              className={`${s.ghost} ${s.reload}`}
              onClick={() => {
                setLoaded(false);
                setReloadKey((k) => k + 1);
              }}
            >
              Reload
            </button>
          )}
          <a className={s.ghost} href={build.url} target="_blank" rel="noopener">
            New tab <span aria-hidden>↗</span>
          </a>
          <button ref={closeRef} type="button" className={s.close} onClick={close}>
            Close <kbd>Esc</kbd>
          </button>
        </div>
      </div>

      <div ref={stageRef} className={s.stage}>
        {build.embeddable ? (
          <div
            className={`${s.device} ${device === 'mobile' ? s.phone : ''}`}
            style={{ width: dev.w * scale, height: dev.h * scale }}
          >
            <iframe
              key={`${build.url}-${device}-${reloadKey}`}
              src={build.url}
              title={`${project.title} — live site`}
              style={{ width: dev.w, height: dev.h, transform: `scale(${scale})` }}
              onLoad={() => setLoaded(true)}
              allow="autoplay; fullscreen"
            />
            <div className={`${s.loading} ${loaded ? s.done : ''}`} aria-hidden={loaded}>
              <span className="label">Loading {host}</span>
              <span ref={countRef} className={s.count}>
                00:00:00:00
              </span>
            </div>
          </div>
        ) : (
          <div className={s.blocked}>
            <div className={s.blockedMedia}>
              <video src={`/previews/${build.slug}.mp4`} poster={`/previews/${build.slug}.webp`} autoPlay muted loop playsInline />
            </div>
            <div className={s.blockedNote}>
              <p className="label">Screen recording of the live site</p>
              <p>
                {host} doesn’t allow itself to be shown inside other websites, so this is a recording instead. The real
                site opens in a new tab.
              </p>
              <a className={s.open} href={build.url} target="_blank" rel="noopener">
                Open {host} <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {build.embeddable && (
        <p className={`label ${s.hint}`}>This is the live site — scroll and click inside the frame to use it</p>
      )}
    </div>,
    document.body,
  );
}
