import { test, expect } from '@playwright/test';
import { USERS } from './data';

test.describe('Діагностика (Крок 7)', () => {
  test('каталог містить 7 товарів (навмисно зламаний тест для трасування)', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.standard.username);
    await page.getByPlaceholder('Password').fill(USERS.standard.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);

    // Навмисна помилка: у каталозі 6 товарів, очікуємо 7
    await expect(page.locator('.inventory_item')).toHaveCount(7, { timeout: 3000 });
  });
});
