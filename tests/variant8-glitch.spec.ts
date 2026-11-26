import { test, expect } from './fixtures';
import { makeCustomer } from './data/factories';

test.describe('Варіант 8: Користувач performance_glitch_user', () => {
  test('каталог завантажується і сортується стабільно без збільшення таймаутів', async ({
    inventoryPage,
  }) => {
    await expect(inventoryPage.cards).toHaveCount(6);
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('оформлення замовлення під performance_glitch_user проходить стабільно', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.product('Sauce Labs Fleece Jacket').addToCart();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomer(makeCustomer());
    await checkoutPage.finish();

    await expect(checkoutPage.completeHeader).toHaveText(
      'Thank you for your order!',
    );
  });
});
