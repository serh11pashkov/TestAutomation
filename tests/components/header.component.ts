import { type Locator } from '@playwright/test';

export class Header {
  readonly cartBadge: Locator;
  private readonly cartLink: Locator;

  constructor(readonly root: Locator) {
    this.cartBadge = root.locator('.shopping_cart_badge');
    this.cartLink = root.locator('.shopping_cart_link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
