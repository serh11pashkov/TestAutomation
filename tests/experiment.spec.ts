import { test, expect } from '@playwright/test';
import { USERS } from './data';

test.describe('Експеримент: порівняння явної паузи та очікувальних тверджень', () => {

  test('Сценарій 1: явна пауза 1000 мс (нестабільний прогін)', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.slow.username);
    await page.getByPlaceholder('Password').fill(USERS.slow.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Явна пауза 1000 мс та одноразове (неочікувальне) отримання тексту
    await page.waitForTimeout(1000);
    const titleText = await page.locator('.title').textContent({ timeout: 500 }).catch(() => null);
    expect(titleText).toBe('Products');
  });

  test('Сценарій 2: твердження очікування await expect()', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.slow.username);
    await page.getByPlaceholder('Password').fill(USERS.slow.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Автоматичне динамічне очікування появи елемента та URL
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });

  test('Сценарій 3: явна пауза 5000 мс (повільний прогін)', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.slow.username);
    await page.getByPlaceholder('Password').fill(USERS.slow.password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Явна надлишкова пауза 5000 мс та одноразове отримання тексту
    await page.waitForTimeout(5000);
    const titleText = await page.locator('.title').textContent({ timeout: 1000 }).catch(() => null);
    expect(titleText).toBe('Products');
  });
});
