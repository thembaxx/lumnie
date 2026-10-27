import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('atomic pathway opens the real lesson, uses fresh final questions, and restores without changing existing progress', async ({
  page,
}, testInfo) => {
  const previousProgress = {
    xp: 75,
    completed: ['trig'],
    scores: { maths: 80 },
    dates: ['2026-10-20'],
  };
  await page.addInitScript((progress) => {
    delete (Navigator.prototype as unknown as { gpu?: unknown }).gpu;
    if (!sessionStorage.getItem('objective-pathway-legacy-seeded')) {
      localStorage.setItem(
        'lumni-playground-v1',
        JSON.stringify({
          profile: { name: 'Pathway learner', grade: 10, goal: 10, onboarded: true },
          progress,
          sound: false,
          haptics: false,
        }),
      );
      sessionStorage.setItem('objective-pathway-legacy-seeded', 'true');
    }
  }, previousProgress);

  await page.goto('/#/play');
  const pathway = page.getByRole('region', { name: 'From particles to atomic structure' });
  await expect(pathway.getByRole('button', { name: 'Record starting answers' })).toBeEnabled();
  await expect(pathway.getByRole('button', { name: 'Record final answers' })).toHaveCount(0);
  await pathway.getByRole('radio', { name: '4 protons', exact: true }).check();
  await pathway
    .getByRole('group', { name: /Boron-11/ })
    .getByLabel('Number of particles')
    .fill('6');
  await pathway
    .getByRole('group', { name: /neutral oxygen-16/ })
    .getByLabel('Number of particles')
    .fill('8');
  await pathway.getByRole('button', { name: 'Record starting answers' }).click();
  await expect(
    pathway.getByText('Starting questions: 2 of 3 correct', { exact: true }),
  ).toBeVisible();

  await pathway.getByRole('link', { name: 'A whole world inside an atom' }).click();
  await expect(page).toHaveURL(/#\/lesson\/atom$/);
  await expect(page.locator('.lesson-intro h2')).toHaveText('A whole world inside an atom');
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/#\/play$/);

  await expect(pathway.getByRole('heading', { name: '3. Try different atoms' })).toBeVisible();
  await expect(pathway.getByRole('group', { name: /lithium-7/ })).toHaveCount(0);
  await pathway
    .getByRole('group', { name: /neutral aluminium-27/ })
    .getByLabel('Number of particles')
    .fill('13');
  await pathway
    .getByRole('group', { name: /Chlorine-37 has atomic number/ })
    .getByLabel('Number of particles')
    .fill('20');
  await pathway
    .getByRole('radio', {
      name: 'Both have 17 protons, but they have different numbers of neutrons.',
      exact: true,
    })
    .check();
  await pathway.getByRole('button', { name: 'Record final answers' }).click();
  await expect(
    pathway.getByText('Different final questions: 3 of 3 correct', { exact: true }),
  ).toBeVisible();

  await page.reload();
  await expect(
    pathway.getByText('Starting questions: 2 of 3 correct', { exact: true }),
  ).toBeVisible();
  await expect(
    pathway.getByText('Different final questions: 3 of 3 correct', { exact: true }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await pathway.getByRole('button', { name: 'Export pathway', exact: true }).click();
  const download = await downloadPromise;
  const backupPath = testInfo.outputPath('atomic-structure-backup.json');
  await download.saveAs(backupPath);
  const backupText = await readFile(backupPath, 'utf8');
  const backup = JSON.parse(backupText);
  expect(backup.format).toBe('lumni-objective-pathway');
  expect(backup.state.baseline.answers['baseline-protons']).toBe('4');
  expect(backup.state.final.answers['final-electrons']).toBe('13');
  expect(backupText).not.toContain('Pathway learner');

  page.once('dialog', (dialog) => dialog.accept());
  await pathway.getByRole('button', { name: 'Start another attempt' }).click();
  await expect(pathway.getByRole('button', { name: 'Record starting answers' })).toBeVisible();
  await expect(
    pathway.getByText('Different final questions: 3 of 3 correct', { exact: true }),
  ).toHaveCount(0);

  page.once('dialog', (dialog) => dialog.accept());
  await pathway.getByLabel('Restore an exported pathway backup').setInputFiles(backupPath);
  await expect(
    pathway.getByText('Starting questions: 2 of 3 correct', { exact: true }),
  ).toBeVisible();
  await expect(
    pathway.getByText('Different final questions: 3 of 3 correct', { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    pathway.getByText('Different final questions: 3 of 3 correct', { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('lumni-playground-v1') || '{}').progress),
    )
    .toEqual(previousProgress);
});
