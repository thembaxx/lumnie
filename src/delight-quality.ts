/**
 * Decorative confetti budget. The achievement state is represented in the UI
 * separately; reduced-motion learners can celebrate without GPU animation.
 */
export function getDelightQuality({
  viewportWidth,
  devicePixelRatio,
  coarsePointer,
  reducedMotion,
}: {
  viewportWidth: number;
  devicePixelRatio: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
}) {
  const mobile = viewportWidth <= 760 || coarsePointer;
  return {
    particles: reducedMotion ? 0 : mobile ? 28 : 70,
    antialias: !mobile,
    resolution: Math.min(Math.max(devicePixelRatio || 1, 1), mobile ? 1 : 1.5),
  };
}
