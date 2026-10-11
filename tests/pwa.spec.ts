import { test, expect } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // The test machine has a software GPU. Exercise the real WebGL fallback.
    delete (Navigator.prototype as unknown as { gpu?: unknown }).gpu;
  });
});

test('saved dark appearance colours the document before React can load', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'lumni-appearance-v1',
      JSON.stringify({ preference: 'dark', palette: 'atlas' }),
    ),
  );
  await page.route('**/_next/static/**/*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'atlas');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 29, 27)');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(24, 29, 27)');
  expect(
    await page
      .locator('meta[name="theme-color"]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute('content'))),
  ).toEqual(['#181d1b', '#181d1b']);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    'href',
    '/manifest-atlas-dark.webmanifest',
  );
});

test('system appearance follows the OS while an explicit choice persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/#/settings');
  await expect(page.getByLabel('App appearance')).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByLabel('App appearance').selectOption('dark');
  await page.reload();
  await expect(page.getByLabel('App appearance')).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const manifest = await page.request
    .get('/manifest-playground-dark.webmanifest')
    .then((response) => response.json());
  expect(manifest.background_color).toBe('#18191d');
  expect(manifest.theme_color).toBe('#18191d');
  expect(
    manifest.icons.find((icon: { purpose: string }) => icon.purpose === 'maskable').sizes,
  ).toBe('512x512');
  expect(manifest.shortcuts.map((shortcut: { url: string }) => shortcut.url)).toEqual([
    '/#/learn',
    '/#/labs',
    '/#/play',
  ]);
});

test('legacy theme survives migration and reload', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('legacy-seeded')) {
      localStorage.setItem('lumni-playground-v1', JSON.stringify({ theme: 'dark' }));
      sessionStorage.setItem('legacy-seeded', 'true');
    }
  });
  await page.goto('/#/settings');
  await expect(page.getByLabel('App appearance')).toHaveValue('dark');
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('lumni-appearance-v1') || '{}').preference,
      ),
    )
    .toBe('dark');
  await page.reload();
  await expect(page.getByLabel('App appearance')).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('Back, Forward, direct links and native sharing behave like an app', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        (window as unknown as { shared: ShareData }).shared = data;
      },
    });
  });
  await page.goto('/');
  await page.locator('.sidebar').getByRole('button', { name: 'Learn', exact: true }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await page.locator('.sidebar-settings').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#\/learn$/);
  await page.goForward();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await page.goto('/?access=private-value#/lesson/electricity');
  await expect(page.locator('.lesson-intro h2')).toHaveText('Get into the current');
  await page.getByRole('button', { name: 'Share this discovery' }).click();
  const shared = await page.evaluate(() => (window as unknown as { shared: ShareData }).shared);
  expect(shared.url).toBe('http://127.0.0.1:4173/#/lesson/electricity');
  expect(shared.url).not.toContain('private-value');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page).toHaveURL(/#\/learn$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('installed build works offline, including unopened 3D and PixiJS modules', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#/settings');
  await expect(page.getByText('Ready for offline learning')).toBeVisible({ timeout: 45_000 });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const before = await page.evaluate(async () =>
    (
      await Promise.all(
        (await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).length),
      )
    ).reduce((sum, count) => sum + count, 0),
  );
  await page.evaluate(() => fetch('/api/private-data').catch(() => null));
  const after = await page.evaluate(async () =>
    (
      await Promise.all(
        (await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).length),
      )
    ).reduce((sum, count) => sum + count, 0),
  );
  expect(after).toBe(before);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Offline. Your discoveries are still here.')).toBeVisible();
  await page.evaluate(() => {
    location.hash = '/lesson/forces';
  });
  await expect(page.locator('.lesson-view .three-scene.is-ready')).toBeVisible();
  await page.locator('.lab-slider input').press('End');
  for (let i = 0; i < 4; i++) await page.locator('.lab-slider input').press('ArrowLeft');
  await expect(page.locator('.coordinate-readout')).toContainText('8.00');
  await page.evaluate(() => {
    location.hash = '/game';
  });
  await expect(page.locator('.garden-stage canvas')).toBeVisible();
  await page.evaluate(() => {
    location.hash = '/quiz/maths';
  });
  await page.locator('.answer').nth(1).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.locator('.answer-feedback')).toBeVisible();
  await page.evaluate(() => {
    location.hash = '/puzzle/2';
  });
  await expect(page.locator('.puzzle-content')).toBeVisible();
  await expect(page.locator('.katex').first()).toBeVisible();
  await page.goto('/not-downloaded/');
  await expect(
    page.getByRole('heading', { name: 'A little pause in the connection.' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('install prompt and optional screen wake lock use supported native APIs', async ({ page }) => {
  await page.addInitScript(() => {
    const native = window as unknown as { locks: number; releases: number; prompted: number };
    native.locks = 0;
    native.releases = 0;
    native.prompted = 0;
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: {
        request: async () => {
          native.locks++;
          const lock = new EventTarget() as EventTarget & {
            released: boolean;
            release: () => Promise<void>;
          };
          lock.released = false;
          lock.release = async () => {
            lock.released = true;
            native.releases++;
            lock.dispatchEvent(new Event('release'));
          };
          return lock;
        },
      },
    });
  });
  await page.goto('/#/settings');
  await expect(page.getByLabel('Keep screen awake')).toBeEnabled();
  await page.getByLabel('Keep screen awake').click();
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      prompt: async () => {
        (window as unknown as { prompted: number }).prompted++;
      },
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    });
    dispatchEvent(event);
  });
  await page.getByRole('button', { name: 'Install', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { prompted: number }).prompted)).toBe(1);
  await expect(page.getByRole('button', { name: 'How to' })).toBeVisible();
  await page.getByRole('button', { name: 'How to' }).click();
  await expect(page.locator('.install-guide')).toBeVisible();
  await page.evaluate(() => {
    location.hash = '/lesson/atom';
  });
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { locks: number }).locks))
    .toBe(1);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { releases: number }).releases))
    .toBe(1);
});

test('phone, tablet and landscape surfaces stay within the viewport', async ({ page }) => {
  await page.goto('/');
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    const background = await page
      .locator('body')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await expect(page.locator('html')).toHaveCSS('background-color', background);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-settings-button').click();
  await expect(page.getByLabel('App appearance')).toBeVisible();
  await expect(page.getByLabel('App appearance')).toHaveCSS('font-size', '16px');
  await expect(page.getByRole('button', { name: 'Close dialog' })).toHaveCSS('height', '44px');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

test('a downloaded update waits until requested and keeps a quiz intact', async ({ page }) => {
  const file = new URL('../out/sw.js', import.meta.url);
  const original = await readFile(file, 'utf8');
  await page.goto('/#/settings');
  await expect(page.getByText('Ready for offline learning')).toBeVisible({ timeout: 45_000 });
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.evaluate(() => {
    location.hash = '/quiz/maths';
  });
  await page.locator('.answer').nth(1).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.locator('.answer-feedback')).toBeVisible();
  try {
    await writeFile(
      file,
      original.replace(/const VERSION = "([^"]+)";/, 'const VERSION = "$1-test-update";'),
    );
    await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.update();
    });
    await expect(page.getByText('A fresh little update is ready.')).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.locator('.answer-feedback')).toBeVisible();
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.getByRole('button', { name: 'Update now' })).toBeEnabled();
    await Promise.all([
      page.waitForEvent('load'),
      page.getByRole('button', { name: 'Update now' }).click(),
    ]);
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await caches.keys()).some((name) => name.endsWith('-test-update')),
        ),
      )
      .toBe(true);
    await expect(page.getByText('A fresh little update is ready.')).toHaveCount(0);
    await expect(page.locator('.main-content')).toBeVisible();
  } finally {
    await writeFile(file, original);
  }
});
