'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { agents, hue, pipeline, products, repos } from '@/lib/content';
import { prefersReducedMotion } from '@/lib/scroll';
import s from './Systems.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const LAST = pipeline.nodes.length - 1;

export default function Systems() {
  const runRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  // Scroll is the clock: the packet travels the pipeline as you move through it.
  useEffect(() => {
    const run = runRef.current;
    const graph = graphRef.current;
    if (!run || !graph) return;
    const st = ScrollTrigger.create({
      trigger: run,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = Math.min(1, self.progress / 0.9);
        graph.style.setProperty('--p', p.toFixed(4));
        const next = Math.min(LAST, Math.floor(p * LAST + 0.02));
        if (next !== stepRef.current) {
          stepRef.current = next;
          setStep(next);
        }
      },
    });
    return () => st.kill();
  }, []);

  // Product recordings play only while on screen.
  const productVideos = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      (items) =>
        items.forEach((item) => {
          const v = item.target as HTMLVideoElement;
          if (item.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.4 },
    );
    productVideos.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);

  const now = pipeline.nodes[step];

  return (
    <section
      id="systems"
      className={`${s.systems} ground-teal`}
      data-chapter="AI Systems"
      data-tone="dark"
      aria-labelledby="systems-title"
      style={{ ['--em' as string]: 'var(--teal)' }}
    >
      <header className="sec-head">
        <p className="sec-index label">
          <span>03 — AI Systems</span>
          <span>Runs in the background</span>
        </p>
        <h2 id="systems-title" className="sec-title" data-split>
          AI agents <em>&amp;</em> automation
        </h2>
        <p className="sec-note" data-reveal>
          The other half of my work has no screen: AI agents that trade, run ads, post and audit on their own, and
          pipelines that make videos and posts without anyone clicking. Scroll on to watch one run.
        </p>
      </header>

      <div ref={runRef} className={s.run}>
        <div className={s.pin}>
          <div className={s.pipeHead}>
            <div>
              <p className="label">{pipeline.meta}</p>
              <h3 className={s.pipeTitle}>{pipeline.title}</h3>
              <p className={s.pipeDesc}>{pipeline.description}</p>
            </div>
            <p className={`label ${s.stepRead}`} style={hue(now.hue)}>
              Step <b>{pad(step + 1)}</b> / {pad(LAST + 1)} · {now.name}
            </p>
          </div>

          <div ref={graphRef} className={s.graph} style={{ ['--p' as string]: 0, ...hue(now.hue) }}>
            <div className={s.track} aria-hidden>
              <span className={s.fill} />
              {pipeline.nodes.map((n, i) => (
                <i key={n.key} className={i <= step ? s.tickOn : ''} style={{ ['--k' as string]: i / LAST }} />
              ))}
              <span className={s.packet} />
            </div>
            <ol className={s.nodes}>
              {pipeline.nodes.map((n, i) => (
                <li
                  key={n.key}
                  className={`${s.node} ${i <= step ? s.nodeOn : ''} ${i === step ? s.nodeNow : ''}`}
                  style={hue(n.hue)}
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span className={s.nodeNo}>{pad(i + 1)}</span>
                  <span className={s.nodeName}>{n.name}</span>
                  <span className={s.nodeLog}>{n.log}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={s.lower}>
            <div className={s.console}>
              <p className="label">Run log</p>
              <ol>
                {pipeline.nodes.map((n, i) => (
                  <li key={n.key} className={i <= step ? s.logOn : ''} style={hue(n.hue)}>
                    <span className={s.mark} aria-hidden>
                      {i === step ? '▸' : ''}
                    </span>
                    <span>{pad(i + 1)}</span>
                    <span className={s.key}>{n.name}</span>
                    <span>{n.log}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className={s.facts}>
              <p>
                <span className="label">Runs on</span>
                {pipeline.infra}
              </p>
              <p>
                <span className="label">Result</span>
                {pipeline.result}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${s.products} wrap`}>
        <div className={s.blockHead} data-reveal>
          <p className="label">Shipped products · 2026</p>
          <h3 className={s.blockTitle}>Live AI products</h3>
          <p className={s.blockIntro}>
            Two systems I built end to end and run every day. Both dashboards sit behind a login, so these are screen
            recordings of the real thing, with account names blurred.
          </p>
        </div>

        <ol className={s.productList}>
          {products.map((p, i) => (
            <li key={p.id} className={s.product} style={hue(p.hue)} data-reveal>
              <a className={s.productMedia} href={p.live} target="_blank" rel="noopener" aria-label={`Open ${p.title}`}>
                <video
                  ref={(el) => {
                    productVideos.current[i] = el;
                  }}
                  src={`/previews/${p.slug}.mp4`}
                  poster={`/previews/${p.slug}.webp`}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
                <span className={`label ${s.productHost}`}>
                  <i aria-hidden /> {p.live.replace(/^https?:\/\//, '')}
                </span>
              </a>
              <div className={s.productBody}>
                <p className={s.productMeta}>
                  <span className={s.productKind}>{p.kind}</span>
                  <span className="label">{p.year}</span>
                </p>
                <h4 className={s.productTitle}>{p.title}</h4>
                <p className={s.productSummary}>{p.summary}</p>
                <ul className={s.productPoints}>
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <dl className={s.productStats}>
                  {p.stats.map((st) => (
                    <div key={st.label}>
                      <dt className="sr-only">{st.label}</dt>
                      <dd>
                        <span className={s.statValue}>{st.value}</span>
                        <span className={s.statLabel}>{st.label}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <ul className={s.productStack} aria-label="Stack">
                  {p.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className={s.productLinks}>
                  <a className="link-arrow" href={p.live} target="_blank" rel="noopener">
                    Live app <span aria-hidden>↗</span>
                  </a>
                  <a className="link-arrow" href={p.repo} target="_blank" rel="noopener">
                    Source on GitHub <span aria-hidden>↗</span>
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className={s.repos}>
          <p className="label">More automation on GitHub</p>
          <ul className={s.repoGrid}>
            {repos.map((r) => (
              <li key={r.name} style={hue(r.hue)} data-reveal>
                <a className={s.repo} href={r.url} target="_blank" rel="noopener">
                  <span className={s.agentCode}>
                    <i aria-hidden /> {r.name}
                  </span>
                  <span className={s.repoTitle}>{r.title}</span>
                  <span className={s.repoBody}>{r.body}</span>
                  <span className={`label ${s.repoLink}`}>
                    View repo <span aria-hidden>↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`${s.agents} wrap`}>
        <div className={s.hermes}>
          <div className={s.blockHead} data-reveal>
            <p className="label">{agents.hermes.meta}</p>
            <h3 className={s.blockTitle}>{agents.hermes.title}</h3>
            <p className={s.blockIntro}>{agents.hermes.intro}</p>
          </div>
          <ul className={s.agentGrid}>
            {agents.hermes.cards.map((a) => (
              <li key={a.code} className={s.agent} style={hue(a.hue)} data-reveal>
                <p className={s.agentCode}>
                  <i aria-hidden /> {a.code}
                </p>
                <h4 className={s.agentTitle}>{a.title}</h4>
                <p className={s.agentBody}>{a.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className={s.claw} style={hue('teal')} data-reveal>
          <p className="label">{agents.openclaw.meta}</p>
          <h3 className={s.blockTitle}>{agents.openclaw.title}</h3>
          <p className={s.blockIntro}>{agents.openclaw.intro}</p>
          <p className={`label ${s.watchLabel}`}>Watching</p>
          <ul className={s.watch} aria-label="Coins it watches">
            {agents.openclaw.watch.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <ul className={s.points}>
            {agents.openclaw.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
