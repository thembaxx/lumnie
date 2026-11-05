import { expect, test } from '@playwright/test';

async function seedLearner(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'lumni-playground-v1',
      JSON.stringify({
        profile: { name: 'Motion learner', grade: 10, goal: 10, onboarded: true },
        progress: { xp: 0, completed: [], scores: {}, dates: [] },
        sound: false,
        haptics: false,
      }),
    );
  });
}

test('reduced motion preserves navigation, dialog focus and onboarding controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seedLearner(page);
  await page.goto('/#/learn');

  const pageSurface = page.locator('[data-motion-intent="page"]');
  await expect(pageSurface).toBeVisible();
  await expect(pageSurface).toHaveAttribute('data-motion-reduced', 'true');
  await expect(pageSurface).toHaveCSS('opacity', '1');

  await page.getByRole('button', { name: 'Edit your profile' }).click();
  const dialog = page.getByRole('dialog', { name: 'Welcome to Lumni' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('data-motion-reduced', 'true');
  await expect(page.locator('[data-motion-intent="backdrop"]')).toHaveAttribute(
    'data-motion-reduced',
    'true',
  );
  await expect(dialog.locator('[data-motion-intent="step"]')).toHaveAttribute(
    'data-motion-reduced',
    'true',
  );
  await expect(dialog).toBeFocused();

  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/#\/learn$/);
});

test('standard motion stays enabled without affecting page or dialog interactions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await seedLearner(page);
  await page.goto('/#/today');

  const pageSurface = page.locator('[data-motion-intent="page"]');
  await expect(pageSurface).toHaveAttribute('data-motion-reduced', 'false');
  await expect(pageSurface).toBeVisible();

  await page.getByRole('button', { name: 'Edit your profile' }).click();
  const dialog = page.getByRole('dialog', { name: 'Welcome to Lumni' });
  await expect(dialog).toHaveAttribute('data-motion-reduced', 'false');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(dialog).toHaveCount(0);
});
