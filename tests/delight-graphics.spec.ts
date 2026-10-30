import { test, expect } from '@playwright/test';
import { getDelightQuality } from '../src/delight-quality';

test('lightweight confetti budget preserves the achievement without overloading mobile GPUs', () => {
  expect(
    getDelightQuality({
      viewportWidth: 390,
      devicePixelRatio: 3,
      coarsePointer: true,
      reducedMotion: false,
    }),
  ).toEqual({ particles: 28, antialias: false, resolution: 1 });
  expect(
    getDelightQuality({
      viewportWidth: 1440,
      devicePixelRatio: 2,
      coarsePointer: false,
      reducedMotion: false,
    }),
  ).toEqual({ particles: 70, antialias: true, resolution: 1.5 });
  expect(
    getDelightQuality({
      viewportWidth: 1280,
      devicePixelRatio: 1.2,
      coarsePointer: true,
      reducedMotion: false,
    }),
  ).toEqual({ particles: 28, antialias: false, resolution: 1 });
  expect(
    getDelightQuality({
      viewportWidth: 390,
      devicePixelRatio: 3,
      coarsePointer: true,
      reducedMotion: true,
    }).particles,
  ).toBe(0);
});
