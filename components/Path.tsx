'use client';

import { useState } from 'react';
import { clips, hue, tracks, type Clip, type Hue } from '@/lib/content';
import s from './Path.module.css';

// Timeline axis in months, Oct 2019 → Jan 2027.
const month = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + (m - 1);
};
const START = month('2019-10');
const END = month('2027-01');
const NOW = month('2026-09') + 0.35;
const SPAN = END - START;
const pct = (m: number) => ((m - START) / SPAN) * 100;
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const clipBox = (c: Clip) => {
  const from = month(c.from);
  const to = c.to ? month(c.to) + 1 : NOW;
  return { left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` };
};

const trackOf = (key: Clip['track']) => tracks.find((t) => t.key === key)!;

// Audio tracks get a waveform, like they would in an editor.
const wave = (fill: string) => {
  let bars = '';
  for (let i = 0; i < 60; i++) {
    const h = 5 + Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)) * 27;
    bars += `<rect x='${i * 3}' y='${((40 - h) / 2).toFixed(1)}' width='1.4' height='${h.toFixed(1)}'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='40' fill='${fill}'>${bars}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
const RGB: Partial<Record<Hue, string>> = {
  amber: '238,177,84',
  blue: '138,193,255',
  violet: '201,173,253',
  teal: '85,214,199',
};
const trackStyle = (h: Hue) => ({
  ...hue(h),
  ['--wave' as string]: wave(`rgba(${RGB[h]},0.38)`),
  ['--wave-on' as string]: wave('rgba(11,10,8,0.25)'),
});

export default function Path() {
  const [selected, setSelected] = useState('kerjaweb3');
  const clip = clips.find((c) => c.id === selected)!;

  return (
    <section
      id="path"
      className={`${s.path} ground-umber`}
      data-chapter="Experience"
      data-tone="dark"
      aria-labelledby="path-title"
      style={{ ['--em' as string]: 'var(--amber)' }}
    >
      <header className="sec-head">
        <p className="sec-index label">
          <span>04 — Experience</span>
          <span>2019 → today</span>
        </p>
        <h2 id="path-title" className="sec-title" data-split>
          Experience
        </h2>
        <p className="sec-note" data-reveal>
          Android intern in 2019, AI &amp; Frontend Engineer in 2026: five companies, four and a half years of freelance
          and a degree along the way. Select any block on the timeline to read what I did there.
        </p>
      </header>

      {/* Desktop: an edit timeline. Pick a clip to inspect it. */}
      <div className={`${s.timeline} wrap`} data-reveal>
        <div className={s.ruler} aria-hidden>
          <span className={s.rulerStart}>2019</span>
          {YEARS.map((y) => (
            <span key={y} className={s.year} style={{ left: `${pct(y * 12)}%` }}>
              {y}
            </span>
          ))}
        </div>

        <div className={s.tracks} role="group" aria-label="Career timeline">
          {tracks.map((t) => (
            <div key={t.key} className={s.track} style={trackStyle(t.hue)}>
              <span className={s.trackName}>
                <b>{t.code}</b> {t.name}
              </span>
              <div className={s.lane}>
                {YEARS.map((y) => (
                  <i key={y} className={s.grid} style={{ left: `${pct(y * 12)}%` }} />
                ))}
                {clips
                  .filter((c) => c.track === t.key)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`${s.clip} ${t.key === 'work' ? s.video : s.audio} ${selected === c.id ? s.clipOn : ''}`}
                      style={clipBox(c)}
                      aria-pressed={selected === c.id}
                      title={`${c.org} — ${c.when}`}
                      onClick={() => setSelected(c.id)}
                    >
                      <span>{c.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
          <div className={s.nowLine} style={{ left: `calc(var(--lane-x) + (100% - var(--lane-x)) * ${pct(NOW) / 100})` }}>
            <span className="label">Now</span>
          </div>
        </div>

        <div key={clip.id} className={s.inspector} aria-live="polite" style={hue(trackOf(clip.track).hue)}>
          <div className={s.inspMeta}>
            <p className={`label ${s.inspTrack}`}>{trackOf(clip.track).name}</p>
            <p className={s.inspWhen}>{clip.when}</p>
            <p className="label">{clip.where}</p>
          </div>
          <div className={s.inspBody}>
            <h3 className={s.inspTitle}>{clip.title}</h3>
            <p className={s.inspOrg}>{clip.org}</p>
            <ul className={s.points}>
              {clip.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {clip.link && (
              <a className="link-arrow" href={clip.link.href} target="_blank" rel="noopener">
                {clip.link.label} <span aria-hidden>↗</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Small screens: the same clips as a list, newest first. */}
      <ol className={`${s.list} wrap`}>
        {[...clips]
          .sort((a, b) => month(b.from) - month(a.from))
          .map((c) => (
            <li key={c.id} style={hue(trackOf(c.track).hue)}>
              <details className={s.item} open={c.id === 'kerjaweb3'}>
                <summary>
                  <span className={`label ${s.itemWhen}`}>
                    {trackOf(c.track).name} · {c.when}
                  </span>
                  <span className={s.itemTitle}>{c.title}</span>
                  <span className={s.itemOrg}>{c.org}</span>
                </summary>
                <p className="label">{c.where}</p>
                <ul className={s.points}>
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {c.link && (
                  <a className="link-arrow" href={c.link.href} target="_blank" rel="noopener">
                    {c.link.label} <span aria-hidden>↗</span>
                  </a>
                )}
              </details>
            </li>
          ))}
      </ol>
    </section>
  );
}
