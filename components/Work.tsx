'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hue, projects, type Project } from '@/lib/content';
import { prefersReducedMotion, scrollToTarget } from '@/lib/scroll';
import { timecode } from '@/lib/timecode';
import ScreeningRoom from './ScreeningRoom';
import s from './Work.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const host = (url: string) => url.replace(/^https?:\/\//, '');
const TOTAL = pad(projects.length);
const BUILDS = pad(projects.reduce((n, p) => n + p.builds.length, 0));

type Screening = { index: number; origin: DOMRect | null; trigger: HTMLElement | null };

export default function Work() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [builds, setBuilds] = useState<Record<string, number>>({});
  const [screening, setScreening] = useState<Screening | null>(null);
  // Unknown until mounted, so no preview media is requested for the wrong layout.
  const [mode, setMode] = useState<'desktop' | 'mobile' | null>(null);
  const desktop = mode === 'desktop';
  const mobile = mode === 'mobile';

  const activeRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const monitorVideos = useRef<(HTMLVideoElement | null)[]>([]);
  const inlineVideos = useRef<(HTMLVideoElement | null)[]>([]);
  const entries = useRef<(HTMLElement | null)[]>([]);
  const monitorVisible = useRef(false);

  const buildOf = useCallback((p: Project) => p.builds[builds[p.id] ?? 0], [builds]);

  const activate = useCallback((i: number) => {
    if (activeRef.current === i) return;
    setPrevious(activeRef.current);
    activeRef.current = i;
    setActive(i);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setMode(mq.matches ? 'desktop' : 'mobile');
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Desktop: whichever entry crosses the middle of the screen owns the monitor.
  useEffect(() => {
    if (!desktop) return;
    const triggers = entries.current.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && activate(i),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, [desktop, activate]);

  // Only the clip on the monitor plays, and only while the monitor is on screen.
  const syncPlayback = useCallback(() => {
    const reduce = prefersReducedMotion();
    monitorVideos.current.forEach((v, i) => {
      if (!v) return;
      if (desktop && i === activeRef.current && monitorVisible.current && !reduce) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [desktop]);

  useEffect(() => {
    const v = monitorVideos.current[active];
    if (v) v.currentTime = 0;
    syncPlayback();
  }, [active, builds, syncPlayback]);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen || !desktop) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        monitorVisible.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.2 },
    );
    io.observe(screen);
    return () => io.disconnect();
  }, [desktop, syncPlayback]);

  // Monitor readout: clip timecode + progress, straight to the DOM.
  useEffect(() => {
    if (!desktop) return;
    let raf = 0;
    const loop = () => {
      const v = monitorVideos.current[activeRef.current];
      if (v && monitorVisible.current) {
        if (tcRef.current) tcRef.current.textContent = timecode(v.currentTime * 30, 30);
        if (progressRef.current && v.duration) {
          progressRef.current.style.transform = `scaleX(${v.currentTime / v.duration})`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [desktop]);

  // Mobile: each entry carries its own clip, playing while mostly in view.
  useEffect(() => {
    if (!mobile || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      (items) => {
        items.forEach((item) => {
          const v = item.target as HTMLVideoElement;
          if (item.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.6 },
    );
    inlineVideos.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, [mobile, builds]);

  const openScreening = (index: number, from: HTMLElement | null) => {
    monitorVideos.current.forEach((v) => v?.pause());
    setScreening({ index, origin: from?.getBoundingClientRect() ?? null, trigger: from });
  };

  const closeScreening = () => {
    const trigger = screening?.trigger;
    setScreening(null);
    requestAnimationFrame(() => {
      trigger?.focus({ preventScroll: true });
      syncPlayback();
    });
  };

  const moveCursor = (e: React.PointerEvent) => {
    const parent = cursorRef.current?.offsetParent as HTMLElement | null;
    if (e.pointerType !== 'mouse' || !cursorRef.current || !parent) return;
    const box = parent.getBoundingClientRect();
    cursorRef.current.style.transform = `translate3d(${e.clientX - box.left}px, ${e.clientY - box.top}px, 0)`;
  };

  const current = projects[active];
  const currentBuild = buildOf(current);

  return (
    <section id="work" className={`${s.work} ground-ink`} data-chapter="Work" data-tone="dark" aria-labelledby="work-title">
      <header className="sec-head">
        <p className="sec-index label">
          <span>02 — Work</span>
          <span>
            {TOTAL} projects · {BUILDS} live builds
          </span>
        </p>
        <h2 id="work-title" className="sec-title" data-split>
          Selected work
        </h2>
        <p className="sec-note" data-reveal>
          Six live websites I built, from a luxury villa and a forex broker to a playful campaign page. Every preview
          is a real screen recording. Open one to try the live site right here, on desktop, tablet or mobile.
        </p>
      </header>

      <div ref={stageRef} className={s.stage}>
        <aside className={s.aside} aria-label="Preview monitor" style={hue(current.hue)}>
          <div className={s.sticky}>
            <button
              ref={screenRef}
              type="button"
              className={s.screen}
              onClick={(e) => openScreening(active, e.currentTarget)}
              onPointerMove={moveCursor}
              aria-label={`Try ${current.title} live`}
            >
              {projects.map((p, i) => {
                const b = buildOf(p);
                const state = i === active ? s.on : i === previous ? s.prev : '';
                return (
                  <span key={p.id} className={`${s.layer} ${state}`} aria-hidden={i !== active}>
                    <video
                      key={b.slug}
                      ref={(el) => {
                        monitorVideos.current[i] = el;
                      }}
                      src={desktop ? `/previews/${b.slug}.mp4` : undefined}
                      poster={desktop ? `/previews/${b.slug}.webp` : undefined}
                      muted
                      loop
                      playsInline
                      preload={i === 0 ? 'metadata' : 'none'}
                    />
                  </span>
                );
              })}
              <span className={s.overlayTop}>
                <span className="label">
                  {pad(active + 1)} / {TOTAL}
                </span>
                <span className="label">
                  <i className={s.dot} /> {host(currentBuild.url)}
                </span>
              </span>
              <span className={s.progress}>
                <span ref={progressRef} />
              </span>
            </button>

            <div className={s.readout}>
              <span className="label">
                {pad(active + 1)} — <span className={s.readTitle}>{current.title}</span>
                {current.builds.length > 1 && <> · {currentBuild.label}</>}
              </span>
              <span ref={tcRef} className={`label ${s.tc}`}>
                00:00:00:00
              </span>
            </div>

            <nav className={s.strip} aria-label="Jump to project">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${s.thumb} ${i === active ? s.thumbOn : ''}`}
                  style={hue(p.hue)}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() =>
                    scrollToTarget(entries.current[i] as HTMLElement, { offset: -window.innerHeight * 0.3 })
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/previews/${buildOf(p).slug}-thumb.webp`} alt="" width={192} height={120} loading="lazy" />
                  <span className="label">{pad(i + 1)}</span>
                  <span className="sr-only">{p.title}</span>
                </button>
              ))}
            </nav>
          </div>

          <div ref={cursorRef} className={s.cursor} aria-hidden>
            <span>{currentBuild.embeddable ? 'Try it live' : 'Watch preview'}</span>
          </div>
        </aside>

        <ol className={s.list}>
          {projects.map((p, i) => {
            const b = buildOf(p);
            return (
              <li
                key={p.id}
                ref={(el) => {
                  entries.current[i] = el;
                }}
                className={`${s.entry} ${i === active ? s.entryOn : ''}`}
                style={hue(p.hue)}
              >
                <article className={s.card} aria-labelledby={`project-${p.id}`}>
                  <p className={s.entryHead}>
                    <span className={s.chip}>{pad(i + 1)}</span>
                    <span className={s.kind}>{p.kind}</span>
                    <span className="label">{p.year}</span>
                  </p>
                  <h3 id={`project-${p.id}`} className={s.title}>
                    {p.title}
                  </h3>

                  <button
                    type="button"
                    className={s.inline}
                    onClick={(e) => openScreening(i, e.currentTarget)}
                    aria-label={`Try ${p.title} live`}
                    tabIndex={desktop ? -1 : undefined}
                  >
                    <video
                      key={b.slug}
                      ref={(el) => {
                        inlineVideos.current[i] = el;
                      }}
                      src={mobile ? `/previews/${b.slug}.mp4` : undefined}
                      poster={mobile ? `/previews/${b.slug}.webp` : undefined}
                      muted
                      loop
                      playsInline
                      preload="none"
                    />
                    <span className={`label ${s.inlineTag}`}>
                      {b.embeddable ? 'Tap to try it live' : 'Tap to watch'}
                    </span>
                  </button>

                  <p className={s.summary}>{p.summary}</p>
                  <p className={s.detail}>{p.detail}</p>
                  <p className={s.role}>
                    <span className="label">Role</span>
                    {p.role}
                  </p>

                  {p.builds.length > 1 && (
                    <div className={s.builds} role="group" aria-label={`${p.title} build`}>
                      <span className="label">Version</span>
                      {p.builds.map((opt, k) => (
                        <button
                          key={opt.slug}
                          type="button"
                          aria-pressed={(builds[p.id] ?? 0) === k}
                          onClick={() => setBuilds((prev) => ({ ...prev, [p.id]: k }))}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <ul className={s.stack} aria-label="Stack">
                    {p.stack.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>

                  <div className={s.actions}>
                    <button
                      type="button"
                      className={s.primary}
                      onClick={(e) =>
                        openScreening(i, desktop ? screenRef.current : (e.currentTarget as HTMLElement))
                      }
                    >
                      {b.embeddable ? 'Try it live' : 'Watch preview'}
                    </button>
                    <a className="link-arrow" href={b.url} target="_blank" rel="noopener">
                      {host(b.url)} <span aria-hidden>↗</span>
                    </a>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>

      {screening && (
        <ScreeningRoom
          project={projects[screening.index]}
          number={pad(screening.index + 1)}
          build={buildOf(projects[screening.index])}
          origin={screening.origin}
          onClose={closeScreening}
        />
      )}
    </section>
  );
}
