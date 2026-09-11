'use client';

import { useEffect, useRef, useState } from 'react';
import { chapters, hue } from '@/lib/content';
import { getLenis, scrollToTarget } from '@/lib/scroll';
import { timecode } from '@/lib/timecode';
import s from './Scrubber.module.css';

const SHUTTLE_PX = 4; // px per frame at 1×
const pad = (n: number) => String(n).padStart(2, '0');

const scrollState = () => {
  const lenis = getLenis();
  const limit = lenis ? lenis.limit : document.documentElement.scrollHeight - window.innerHeight;
  const y = lenis ? lenis.scroll : window.scrollY;
  return { lenis, y, limit: Math.max(1, limit) };
};

/**
 * The page is a film and scroll is the playhead. This bar is the edit
 * timeline: timecode, shuttle speed, chapter markers, and a scrubbable ruler.
 */
export default function Scrubber() {
  const rulerRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const [marks, setMarks] = useState<number[]>(() => chapters.map((_, i) => i / chapters.length));
  const [chapter, setChapter] = useState(0);
  const [menu, setMenu] = useState(false);

  const marksRef = useRef(marks);
  const chapterRef = useRef(0);
  const shuttle = useRef({ dir: 0, level: 0 });
  const drag = useRef<{ id: number; x: number; moved: boolean; onMarker: boolean } | null>(null);

  // Where each chapter starts, as a fraction of the page.
  useEffect(() => {
    const measure = () => {
      const { limit } = scrollState();
      const next = chapters.map((c) => {
        const el = document.getElementById(c.id);
        if (!el) return 0;
        return Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / limit);
      });
      marksRef.current = next;
      setMarks(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  // One loop drives the readouts and the shuttle; DOM writes only on change.
  useEffect(() => {
    let raf = 0;
    let lastY = -1;
    let still = 0;
    let lastStatus = '';
    let lastPct = -1;
    const ruler = rulerRef.current!;

    const loop = () => {
      const { lenis, y, limit } = scrollState();
      const sh = shuttle.current;

      if (sh.dir !== 0) {
        if (!lenis || lenis.isStopped) {
          sh.dir = 0;
        } else {
          const target = Math.max(0, Math.min(limit, y + sh.dir * SHUTTLE_PX * 2 ** sh.level));
          lenis.scrollTo(target, { immediate: true });
          if (target <= 0 || target >= limit) sh.dir = 0;
        }
      }

      const velocity = lenis ? lenis.velocity : y - lastY;
      if (y !== lastY) {
        const p = Math.min(1, Math.max(0, y / limit));
        ruler.style.setProperty('--p', p.toFixed(5));
        if (tcRef.current) tcRef.current.textContent = timecode(y);
        const pct = Math.round(p * 100);
        if (pct !== lastPct) {
          ruler.setAttribute('aria-valuenow', String(pct));
          lastPct = pct;
        }
        let c = 0;
        marksRef.current.forEach((m, i) => {
          if (p + 0.002 >= m) c = i;
        });
        if (c !== chapterRef.current) {
          chapterRef.current = c;
          setChapter(c);
          ruler.setAttribute('aria-valuetext', `${pct}%, ${chapters[c].label}`);
        }
        lastY = y;
        still = 0;
      } else {
        still++;
      }

      let status: string;
      if (drag.current?.moved) status = 'Scrub';
      else if (sh.dir !== 0) status = `${sh.dir > 0 ? '▶▶' : '◀◀'} ${2 ** sh.level}.0×`;
      else if (still < 8 && Math.abs(velocity) > 0.15)
        status = `${velocity > 0 ? '▶' : '◀'} ${Math.min(99.9, Math.abs(velocity) / 12).toFixed(1)}×`;
      else status = '❚❚ Pause';
      if (status !== lastStatus && statusRef.current) {
        statusRef.current.textContent = status;
        statusRef.current.dataset.live = status.startsWith('❚❚') ? 'false' : 'true';
        lastStatus = status;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // J / K / L shuttle, like any edit suite. Any manual scroll takes over.
  useEffect(() => {
    const stop = () => {
      shuttle.current.dir = 0;
      shuttle.current.level = 0;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"]')) return;
      const sh = shuttle.current;
      const key = e.key.toLowerCase();
      if (key === 'l' || key === 'j') {
        const dir = key === 'l' ? 1 : -1;
        sh.level = sh.dir === dir ? Math.min(sh.level + 1, 3) : 0;
        sh.dir = dir;
      } else if (key === 'k') {
        stop();
      } else {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
  }, []);

  // Close the chapter menu on outside click / Esc.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !toggleRef.current?.contains(t)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const fraction = (clientX: number) => {
    const r = rulerRef.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };

  // A press that doesn't travel is a click (jump, or the marker's own click);
  // once it travels 3px it becomes a scrub and the ruler captures the pointer.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    shuttle.current.dir = 0;
    const onMarker = !!(e.target as HTMLElement).closest('button');
    drag.current = { id: e.pointerId, x: e.clientX, moved: false, onMarker };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x) < 3) return;
      d.moved = true;
      rulerRef.current!.setPointerCapture(e.pointerId);
    }
    scrollToTarget(fraction(e.clientX) * scrollState().limit, { immediate: true });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && !d.onMarker) scrollToTarget(fraction(e.clientX) * scrollState().limit, { duration: 1.2 });
    drag.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { y, limit } = scrollState();
    const p = y / limit;
    const steps: Record<string, number> = {
      ArrowRight: 0.02,
      ArrowUp: 0.02,
      ArrowLeft: -0.02,
      ArrowDown: -0.02,
      PageUp: -0.1,
      PageDown: 0.1,
    };
    let next: number | null = null;
    if (e.key in steps) next = p + steps[e.key];
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = 1;
    if (next === null) return;
    e.preventDefault();
    scrollToTarget(Math.min(1, Math.max(0, next)) * limit, { duration: 0.6 });
  };

  const goTo = (i: number) => {
    shuttle.current.dir = 0;
    setMenu(false);
    scrollToTarget(i === 0 ? 0 : `#${chapters[i].id}`, { duration: 1.4 });
  };

  return (
    <div className={s.bar} style={hue(chapters[chapter].hue)} data-intro>
      <div className={s.readouts}>
        <span className={s.rec} aria-hidden />
        <span ref={tcRef} className={s.tc} aria-label="Timecode">
          00:00:00:00
        </span>
        <span ref={statusRef} className={s.status} aria-hidden>
          ❚❚ Pause
        </span>
      </div>

      <div
        ref={rulerRef}
        className={s.ruler}
        role="slider"
        tabIndex={0}
        aria-label="Page position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext={`0%, ${chapters[0].label}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={onKeyDown}
        style={{ ['--p' as string]: 0 }}
      >
        <span className={s.ticks} aria-hidden />
        <span className={s.played} aria-hidden />
        {marks.map((m, i) => (
          <button
            key={chapters[i].id}
            type="button"
            tabIndex={-1}
            className={`${s.marker} ${i === chapter ? s.markerOn : ''} ${m > 0.82 ? s.markerEnd : ''}`}
            style={{ left: `${m * 100}%`, ...hue(chapters[i].hue) }}
            onClick={() => goTo(i)}
            aria-hidden
          >
            {pad(i)}
            <span className={s.markerName}>{chapters[i].label}</span>
          </button>
        ))}
        <span className={s.headTrack} aria-hidden>
          <span className={s.head} />
        </span>
      </div>

      <div className={s.chapterWrap}>
        <button
          ref={toggleRef}
          type="button"
          className={s.chapter}
          aria-expanded={menu}
          aria-controls="chapter-menu"
          onClick={() => setMenu((m) => !m)}
        >
          <span className={s.chapterNo}>{pad(chapter)}</span>
          <span>{chapters[chapter].label}</span>
          <span aria-hidden className={s.caret}>
            ▴
          </span>
        </button>
        <div ref={menuRef} id="chapter-menu" className={s.menu} hidden={!menu}>
          <p className="label">Chapters</p>
          <ol>
            {chapters.map((c, i) => (
              <li key={c.id} style={hue(c.hue)}>
                <button type="button" aria-current={i === chapter ? 'true' : undefined} onClick={() => goTo(i)}>
                  <span className="label">{pad(i)}</span>
                  {c.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
