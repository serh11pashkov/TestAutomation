import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';

const standardAuthFile = '.auth/standard.json';
const glitchAuthFile = '.auth/glitch.json';

setup('вхід стандартного користувача', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.loginAs('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: standardAuthFile });
});

setup('вхід performance_glitch_user (Варіант 8)', async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.loginAs('performance_glitch_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: glitchAuthFile });
});
