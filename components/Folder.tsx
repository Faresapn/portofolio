'use client';

import { useEffect, useRef } from 'react';
import s from './Folder.module.css';

/**
 * A stack of project folders. Every folder in the stack gets the sheet height and
 * tab width of the largest one, so they all park in exactly the same spot and
 * each new folder covers the one before it completely.
 */
export function FolderList({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    let raf = 0;

    const measure = () => {
      // Read natural sizes first, then hand the largest to every folder.
      list.style.removeProperty('--sheet-min');
      list.style.removeProperty('--tab-w');
      const sheets = Array.from(list.querySelectorAll<HTMLElement>(`.${s.sheet}`));
      const tabs = Array.from(list.querySelectorAll<HTMLElement>(`.${s.tab}`));
      const sheetMax = Math.max(0, ...sheets.map((el) => el.offsetHeight));
      const tabMax = Math.max(0, ...tabs.map((el) => el.offsetWidth));
      list.style.setProperty('--sheet-min', `${sheetMax}px`);
      list.style.setProperty('--tab-w', `${Math.ceil(tabMax)}px`);
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    document.fonts?.ready.then(schedule);
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <ol ref={ref} className={`${s.list} ${className}`}>
      {children}
    </ol>
  );
}

/** One folder: a numbered tab, text on the left, media on the right. */
export default function Folder({
  index,
  tab,
  labelledBy,
  media,
  children,
}: {
  index: number;
  tab: string;
  labelledBy: string;
  media: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className={s.item}>
      <article className={s.folder} aria-labelledby={labelledBy}>
        <p className={s.tab} aria-hidden>
          <b>{String(index + 1).padStart(2, '0')}</b>
          {tab}
        </p>
        <div className={s.sheet}>
          <div className={s.text}>{children}</div>
          <div className={s.media}>{media}</div>
        </div>
      </article>
    </li>
  );
}

export const folderStyles = s;
