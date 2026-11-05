/** Conservative Three.js output for small, retina and software-rendered learning scenes. */
export function isSoftwareSceneRenderer(name: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(name);
}

export function sceneRenderBudget({
  width,
  height,
  pixelRatio,
  coarsePointer,
  softwareRenderer,
}: {
  width: number;
  height: number;
  pixelRatio: number;
  coarsePointer: boolean;
  softwareRenderer: boolean;
}) {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const aspect = safeWidth / safeHeight;
  const mobile = coarsePointer || safeWidth <= 760;
  const safePixelRatio = Number.isFinite(pixelRatio) ? Math.max(1, pixelRatio) : 1;
  return {
    dpr: Math.min(safePixelRatio, softwareRenderer ? 1 : mobile ? 1.4 : 2),
    antialias: !softwareRenderer && !mobile,
    // Keep orbital electrons and on-canvas labels inside narrow display surfaces.
    cameraDistance: Math.min(17, 9.4 * Math.max(1, 0.96 / Math.max(0.5, aspect))),
  };
}
