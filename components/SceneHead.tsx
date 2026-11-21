import { SCENES } from '@/lib/scenes';

/** Scene chip, headline and one short paragraph: the same opening for every section. */
export default function SceneHead({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children?: React.ReactNode;
}) {
  const scene = SCENES.find((s) => s.id === id)!;
  return (
    <header className="wrap">
      <p className="scene-chip">
        <b>{scene.no}</b>
        {scene.title}
      </p>
      <h2 id={`${id}-title`} className="headline">
        {title}
      </h2>
      {children && <p className="lede">{children}</p>}
    </header>
  );
}
