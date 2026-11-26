import { test, expect } from './fixtures';

test.describe('Каталог товарів', () => {
  test('каталог містить шість товарів', async ({ inventoryPage }) => {
    await expect(inventoryPage.cards).toHaveCount(6);
  });

  test('сортування за зростанням ціни впорядковує список', async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('додавання товару оновлює лічильник кошика', async ({
    inventoryPage,
  }) => {
    await inventoryPage.product('Sauce Labs Backpack').addToCart();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });

  test('видалення товару очищає лічильник', async ({ inventoryPage }) => {
    const backpack = inventoryPage.product('Sauce Labs Backpack');
    await backpack.addToCart();
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    await backpack.remove();
    await expect(inventoryPage.header.cartBadge).toBeHidden();
  });
});
