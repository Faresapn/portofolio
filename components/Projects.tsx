'use client';

import { useState } from 'react';
import { projects, type Project } from '@/lib/content';
import { useAutoplay } from '@/lib/useAutoplay';
import Folder, { FolderList, folderStyles as f } from './Folder';
import SceneHead from './SceneHead';
import ScreeningRoom from './ScreeningRoom';

type Screening = { index: number; origin: DOMRect | null; trigger: HTMLElement | null };

export default function Projects() {
  const [builds, setBuilds] = useState<Record<string, number>>({});
  const [screening, setScreening] = useState<Screening | null>(null);
  const buildOf = (p: Project) => p.builds[builds[p.id] ?? 0];

  const open = (index: number, from: HTMLElement) =>
    setScreening({ index, origin: from.getBoundingClientRect(), trigger: from });

  const close = () => {
    const trigger = screening?.trigger;
    setScreening(null);
    requestAnimationFrame(() => trigger?.focus({ preventScroll: true }));
  };

  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <SceneHead id="work" title="Websites I’ve built.">
        Six live websites, from a luxury villa and a forex broker to a paid prompt marketplace. Each preview is a screen
        recording. Press Try it live to use the real site.
      </SceneHead>

      <FolderList className="wrap">
        {projects.map((p, i) => {
          const b = buildOf(p);
          return (
            <Folder
              key={p.id}
              index={i}
              tab={p.title}
              labelledBy={`project-${p.id}`}
              media={
                <Preview
                  slug={b.slug}
                  label={b.embeddable ? 'Try it live' : 'Watch preview'}
                  title={p.title}
                  onOpen={(el) => open(i, el)}
                />
              }
            >
              <p className={f.kind}>
                {p.kind} · {p.year}
              </p>
              <h3 id={`project-${p.id}`} className={f.title}>
                {p.title}
              </h3>
              <p className={`${f.summary} ${f.more}`}>{p.summary}</p>
              <p className={`${f.small} ${f.more}`}>{p.detail}</p>
              <p className={f.small}>
                <strong>My role:</strong> {p.role}
              </p>

              {p.builds.length > 1 && (
                <div className={f.actions} role="group" aria-label={`${p.title} version`}>
                  {p.builds.map((opt, k) => (
                    <button
                      key={opt.slug}
                      type="button"
                      className={`btn ${(builds[p.id] ?? 0) === k ? 'btn-primary' : 'btn-ghost'}`}
                      aria-pressed={(builds[p.id] ?? 0) === k}
                      onClick={() => setBuilds((prev) => ({ ...prev, [p.id]: k }))}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              <ul className="chips" aria-label="Stack">
                {p.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>

              <div className={f.actions}>
                <button type="button" className="btn btn-primary" onClick={(e) => open(i, e.currentTarget)}>
                  {b.embeddable ? 'Try it live' : 'Watch preview'}
                </button>
              </div>
            </Folder>
          );
        })}
      </FolderList>

      {screening && (
        <ScreeningRoom
          project={projects[screening.index]}
          number={String(screening.index + 1).padStart(2, '0')}
          build={buildOf(projects[screening.index])}
          origin={screening.origin}
          onClose={close}
        />
      )}
    </section>
  );
}

function Preview({
  slug,
  label,
  title,
  onOpen,
}: {
  slug: string;
  label: string;
  title: string;
  onOpen: (el: HTMLElement) => void;
}) {
  const ref = useAutoplay<HTMLVideoElement>([slug]);
  return (
    <button
      type="button"
      className={f.screen}
      onClick={(e) => onOpen(e.currentTarget)}
      aria-label={`${label}: ${title}`}
    >
      <video
        key={slug}
        ref={ref}
        src={`/previews/${slug}.mp4`}
        poster={`/previews/${slug}.webp`}
        muted
        loop
        playsInline
        preload="none"
      />
      <span className={f.screenTag}>{label}</span>
    </button>
  );
}
