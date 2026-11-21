'use client';

import { useState } from 'react';
import { agents, pipeline, products, repos, type Product } from '@/lib/content';
import { useAutoplay } from '@/lib/useAutoplay';
import Folder, { FolderList, folderStyles as f } from './Folder';
import SceneHead from './SceneHead';
import WatchModal from './WatchModal';
import s from './AiSystems.module.css';

const host = (url: string) => url.replace(/^https?:\/\//, '');

export default function AiSystems() {
  const [watching, setWatching] = useState<{ product: Product; trigger: HTMLElement } | null>(null);
  const watch = (product: Product) => (e: React.MouseEvent<HTMLElement>) =>
    setWatching({ product, trigger: e.currentTarget });
  const stopWatching = () => {
    const trigger = watching?.trigger;
    setWatching(null);
    requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
  };

  return (
    <section id="systems" className="section" aria-labelledby="systems-title">
      <SceneHead id="systems" title="AI agents and automation.">
        AI agents that trade, run ads, post to social media and audit websites, plus pipelines that produce videos and
        posts automatically. The Hermes agents run at Kerja Web3. The other products and tools are my own projects.
      </SceneHead>

      {/* Live products */}
      <FolderList className="wrap">
        {products.map((p, i) => (
          <Folder
            key={p.id}
            index={i}
            tab={p.title}
            labelledBy={`product-${p.id}`}
            media={<Recording product={p} onWatch={p.walkthrough ? watch(p) : undefined} />}
          >
            <p className={f.kind}>
              {p.kind} · {p.year}
            </p>
            <h3 id={`product-${p.id}`} className={f.title}>
              {p.title}
            </h3>
            <p className={`${f.summary} ${f.more}`}>{p.summary}</p>
            <ul className={`${s.points} ${f.more}`}>
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            {p.stats.length > 0 && (
              <dl className={`${s.stats} ${f.more}`}>
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
            )}
            <ul className="chips" aria-label="Stack">
              {p.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className={f.actions}>
              {p.walkthrough && (
                <button type="button" className="btn btn-primary" onClick={watch(p)}>
                  Watch the walkthrough ({p.walkthrough.length})
                </button>
              )}
              {p.live && (
                <a
                  className={`btn ${p.walkthrough ? 'btn-ghost' : 'btn-primary'}`}
                  href={p.live}
                  target="_blank"
                  rel="noopener"
                >
                  {host(p.live)} ↗
                </a>
              )}
              {p.repo && (
                <a className="btn btn-ghost" href={p.repo} target="_blank" rel="noopener">
                  Source on GitHub ↗
                </a>
              )}
              {p.privateRepo && <span className={`${s.private} ${f.more}`}>Private repository</span>}
            </div>
          </Folder>
        ))}
      </FolderList>

      <div className={`wrap ${s.blocks}`}>
        {/* Hermes at Kerja Web3 */}
        <div className={s.block}>
          <div className={s.blockHead}>
            <p className="label">{agents.hermes.meta}</p>
            <h3 className={s.blockTitle}>{agents.hermes.title}</h3>
            <p className={s.blockIntro}>{agents.hermes.intro}</p>
          </div>
          <ul className={s.agents}>
            {agents.hermes.cards.map((a) => (
              <li key={a.code} className={s.agent}>
                <code className={s.code}>{a.code}</code>
                <h4 className={s.agentTitle}>{a.title}</h4>
                <p className={s.agentBody}>{a.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* n8n pipeline: a real sequence, so the steps are numbered */}
        <div className={s.block}>
          <div className={s.blockHead}>
            <p className="label">{pipeline.meta}</p>
            <h3 className={s.blockTitle}>{pipeline.title}</h3>
            <p className={s.blockIntro}>
              {pipeline.description} {pipeline.infra} {pipeline.result}
            </p>
          </div>
          <ol className={s.steps}>
            {pipeline.nodes.map((n, i) => (
              <li key={n.key} className={s.step}>
                <span className={s.stepNo}>{i + 1}</span>
                <span className={s.stepName}>{n.name}</span>
                <span className={s.stepLog}>{n.log}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* OpenClaw + open-source repos */}
        <div className={s.duo}>
          <div className={s.block}>
            <div className={s.blockHead}>
              <p className="label">{agents.openclaw.meta}</p>
              <h3 className={s.blockTitle}>{agents.openclaw.title}</h3>
              <p className={s.blockIntro}>{agents.openclaw.intro}</p>
            </div>
            <ul className={s.points}>
              {agents.openclaw.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <ul className="chips" aria-label="Coins watched">
              {agents.openclaw.watch.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className={s.block}>
            <div className={s.blockHead}>
              <p className="label">Open source</p>
              <h3 className={s.blockTitle}>Automation repos</h3>
            </div>
            <ul className={s.repos}>
              {repos.map((r) => (
                <li key={r.name}>
                  <a href={r.url} target="_blank" rel="noopener" className={s.repo}>
                    <span className={s.repoTitle}>
                      {r.title} <span aria-hidden>↗</span>
                    </span>
                    <span className={s.repoBody}>{r.body}</span>
                    <code className={s.code}>{r.name}</code>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {watching?.product.walkthrough && (
        <WatchModal
          src={watching.product.walkthrough.src}
          poster={`/previews/${watching.product.slug}.webp`}
          title={`${watching.product.title} walkthrough`}
          note={`${watching.product.walkthrough.length} · ${watching.product.walkthrough.language}`}
          onClose={stopWatching}
        />
      )}
    </section>
  );
}

function Recording({
  product: p,
  onWatch,
}: {
  product: Product;
  onWatch?: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const ref = useAutoplay<HTMLVideoElement>();
  const video = (
    <video
      ref={ref}
      src={`/previews/${p.slug}.mp4`}
      poster={`/previews/${p.slug}.webp`}
      muted
      loop
      playsInline
      preload="none"
    />
  );
  if (onWatch) {
    return (
      <button
        type="button"
        className={f.screen}
        onClick={onWatch}
        aria-label={`Watch the ${p.title} walkthrough with sound`}
      >
        {video}
        <span className={f.screenTag}>▶ Watch with sound</span>
      </button>
    );
  }
  return (
    <div className={f.screen} role="img" aria-label={`Screen recording of ${p.title}`}>
      {video}
      <span className={f.screenTag}>Screen recording · behind login</span>
    </div>
  );
}
