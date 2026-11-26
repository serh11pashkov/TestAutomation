import { test, expect } from './fixtures';

test.describe('Вхід до системи', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('користувач із коректними даними потрапляє до каталогу', async ({
    loginPage,
    page,
  }) => {
    await loginPage.open();
    await loginPage.loginAs('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('заблокований користувач отримує повідомлення про помилку', async ({
    loginPage,
  }) => {
    await loginPage.open();
    await loginPage.loginAs('locked_out_user', 'secret_sauce');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText(/locked out/i);
  });

  test('порожні поля не пропускають до системи', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.loginAs('', '');
    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).toContainText(/Username is required/i);
  });
});
