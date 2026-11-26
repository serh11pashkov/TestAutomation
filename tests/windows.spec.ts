import { test, expect } from '@playwright/test';

test.describe('Робота з новими вкладками', () => {
  test('відкриття посилання в новій вкладці', async ({ page, context }) => {
    await page.goto('/windows');

    const pagePromise = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState();
    await expect(newPage.locator('h3')).toHaveText('New Window');

    // Вихідна вкладка залишається доступною
    await expect(page.locator('h3')).toHaveText('Opening a new window');
    await newPage.close();
  });
});
