import { test, expect } from '@playwright/test';
import { USERS } from './data';

test.describe('Варіант 8: Оформлення замовлення (Checkout)', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Авторизація стандартним користувачем
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(USERS.standard.username);
    await page.getByPlaceholder('Password').fill(USERS.standard.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\.html/);

    // 2. Додавання товару до кошика для переходу до оформлення
    await page
      .locator('.inventory_item')
      .filter({ hasText: 'Sauce Labs Backpack' })
      .getByRole('button', { name: 'Add to cart' })
      .click();

    // 3. Перехід у кошик
    await page.locator('[data-test="shopping-cart-link"]').click();
    await expect(page).toHaveURL(/cart\.html/);

    // 4. Перехід до першого кроку оформлення замовлення
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('оформлення замовлення з порожнім полем прізвища: перевірка помилки та відсутності переходу', async ({ page }) => {
    // Заповнення поля First Name семантичним локатором за плейсхолдером / test-id
    await page.getByPlaceholder('First Name').fill('Тарас');

    // Поле Last Name навмисно залишаємо порожнім
    await page.getByPlaceholder('Last Name').fill('');

    // Заповнення поля Postal Code
    await page.getByPlaceholder('Zip/Postal Code').fill('01001');

    // Натискання кнопки продовження
    await page.getByRole('button', { name: 'Continue' }).click();

    // Перевірка 1: Відображення повідомлення про помилку
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();

    // Перевірка 2: Зміст повідомлення про обов'язковість прізвища
    await expect(errorMessage).toContainText(/Error: Last Name is required/i);

    // Перевірка 3: Відсутність переходу до наступного кроку (checkout-step-two.html)
    await expect(page).not.toHaveURL(/checkout-step-two\.html/);

    // Перевірка 4: Залишаємося на сторінці введення даних покупця
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('відновлення після помилки: внесення прізвища дозволяє успішно продовжити оформлення', async ({ page }) => {
    // Крок 1: Заповнення даних без прізвища
    await page.getByPlaceholder('First Name').fill('Оксана');
    await page.getByPlaceholder('Zip/Postal Code').fill('79000');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Перевірка виникнення помилки
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/Last Name is required/i);

    // Крок 2: Виправлення помилки шляхом введення прізвища
    await page.getByPlaceholder('Last Name').fill('Петренко');

    // Крок 3: Повторне натискання Continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // Перевірка 1: Успішний перехід на сторінку огляду замовлення
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    // Перевірка 2: Наявність заголовка наступного кроку
    await expect(page.getByText('Checkout: Overview')).toBeVisible();

    // Перевірка 3: Повідомлення про помилку більше не відображається
    await expect(errorMessage).not.toBeVisible();
  });
});
