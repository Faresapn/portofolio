export const FPS = 24;

const pad = (n: number) => String(n).padStart(2, '0');

/** Frames → HH:MM:SS:FF, the way an edit timeline reads. */
export function timecode(frames: number, fps = FPS) {
  const f = Math.max(0, Math.floor(frames));
  const s = Math.floor(f / fps);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % fps)}`;
}
