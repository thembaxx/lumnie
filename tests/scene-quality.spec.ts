import { expect, test } from '@playwright/test';
import { isSoftwareSceneRenderer, sceneRenderBudget } from '../src/scene-quality';

test('retina desktop scene keeps 2x definition without oversampling', () => {
  const quality = sceneRenderBudget({
    width: 1280,
    height: 720,
    pixelRatio: 3,
    coarsePointer: false,
    softwareRenderer: false,
  });
  expect(quality.dpr).toBe(2);
  expect(quality.antialias).toBe(true);
  expect(quality.cameraDistance).toBe(9.4);
});

test('narrow mobile learns without clipping and uses a conservative GPU budget', () => {
  const quality = sceneRenderBudget({
    width: 320,
    height: 640,
    pixelRatio: 3,
    coarsePointer: true,
    softwareRenderer: false,
  });
  expect(quality.dpr).toBe(1.4);
  expect(quality.antialias).toBe(false);
  expect(quality.cameraDistance).toBeGreaterThan(9.4);
  expect(quality.cameraDistance).toBeLessThanOrEqual(17);
});

test('software WebGL receives a fallback while native hardware retains detail', () => {
  expect(isSoftwareSceneRenderer('ANGLE SwiftShader Device')).toBe(true);
  expect(isSoftwareSceneRenderer('Mesa llvmpipe')).toBe(true);
  expect(isSoftwareSceneRenderer('Apple GPU')).toBe(false);
  const fallback = sceneRenderBudget({
    width: 1920,
    height: 1080,
    pixelRatio: 4,
    coarsePointer: false,
    softwareRenderer: true,
  });
  expect(fallback.dpr).toBe(1);
  expect(fallback.antialias).toBe(false);
});
