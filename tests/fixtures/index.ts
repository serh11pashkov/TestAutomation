import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';

function hash(s: string): number {
  let h = 0;
  for (const ch of s) {
    h = (h * 31 + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(h);
}

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  seedFaker: void;
};

export const test = base.extend<Pages>({
  seedFaker: [
    async ({}, use, testInfo) => {
      faker.seed(hash(testInfo.titlePath.join(' > ')));
      await use();
    },
    { auto: true },
  ],
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    const inventory = new InventoryPage(page);
    await inventory.open();
    await use(inventory);
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect };
