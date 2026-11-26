import { test, expect } from '@playwright/test';

test.describe('Робота з фреймами', () => {
  test('звертання до тексту у вбудованому редакторі', async ({ page }) => {
    await page.goto('/iframe');

    const closeBanner = page.locator('.tox-notification__dismiss');
    if (await closeBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBanner.click();
    }

    const editor = page.frameLocator('#mce_0_ifr').locator('#tinymce');
    await expect(editor).toBeVisible();
    await expect(editor).toContainText('Your content goes here.');

    const isEditable = await editor.getAttribute('contenteditable');
    if (isEditable === 'true') {
      await editor.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('Текст, уведений автотестом');
      await expect(editor).toContainText('Текст, уведений автотестом');
    }
  });
});
