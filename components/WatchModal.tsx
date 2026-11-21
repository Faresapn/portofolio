'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll } from '@/lib/scroll';
import s from './WatchModal.module.css';

/** A dark room for one landscape video with sound, e.g. a product walkthrough. */
export default function WatchModal({
  src,
  poster,
  title,
  note,
  onClose,
}: {
  src: string;
  poster?: string;
  title: string;
  note?: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);

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
      } else if (e.key === 'Tab' && roomRef.current) {
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
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={roomRef}
      className={s.room}
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-title"
      data-lenis-prevent
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={s.bar}>
        <div>
          <h2 id="watch-title" className={s.title}>
            {title}
          </h2>
          {note && <p className={s.note}>{note}</p>}
        </div>
        <button ref={closeRef} type="button" className={s.close} onClick={onClose}>
          Close <kbd>Esc</kbd>
        </button>
      </div>
      <video className={s.video} src={src} poster={poster} controls autoPlay playsInline />
    </div>,
    document.body,
  );
}
