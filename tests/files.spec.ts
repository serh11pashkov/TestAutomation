import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

test.describe('Файлові операції', () => {
  test('вивантаження файлу на сервер', async ({ page }) => {
    await page.goto('/upload');
    const filePath = path.join(__dirname, 'files', 'upload-sample.txt');
    await page.locator('#file-upload').setInputFiles(filePath);
    await page.locator('#file-submit').click();

    await expect(page.locator('#uploaded-files')).toHaveText(
      'upload-sample.txt',
    );
  });

  test('завантаження файлу зі сторінки', async ({ page }) => {
    await page.goto('/download');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('.example a').first().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBeTruthy();

    const target = path.join(
      test.info().outputDir,
      download.suggestedFilename(),
    );
    await download.saveAs(target);

    expect(fs.existsSync(target)).toBe(true);
    expect(fs.statSync(target).size).toBeGreaterThan(0);
  });
});
