import { test, expect } from './fixtures';
import { makeCustomer } from './data/factories';

test.describe('Оформлення замовлення', () => {
  test('успішне оформлення замовлення завершується подякою', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.product('Sauce Labs Bike Light').addToCart();
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomer(makeCustomer());
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText(
      'Thank you for your order!',
    );
  });

  test('порожнє прізвище блокує оформлення', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await inventoryPage.product('Sauce Labs Onesie').addToCart();
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomer(makeCustomer({ lastName: '' }));

    await expect(checkoutPage.error).toBeVisible();
    await expect(checkoutPage.error).toContainText(/Last Name is required/);
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('відновлення після помилки порожнього прізвища', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    await inventoryPage.product('Sauce Labs Backpack').addToCart();
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomer(makeCustomer({ lastName: '' }));

    await expect(checkoutPage.error).toBeVisible();
    await checkoutPage.fillLastNameAndContinue(makeCustomer().lastName);

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.overviewTitle).toBeVisible();
    await expect(checkoutPage.error).toBeHidden();
  });
});
