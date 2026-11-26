import { type Locator } from '@playwright/test';

export class ProductCard {
  readonly name: Locator;
  readonly price: Locator;
  private readonly addButton: Locator;
  private readonly removeButton: Locator;

  constructor(readonly root: Locator) {
    this.name = root.locator('.inventory_item_name');
    this.price = root.locator('.inventory_item_price');
    this.addButton = root.getByRole('button', { name: 'Add to cart' });
    this.removeButton = root.getByRole('button', { name: 'Remove' });
  }

  async addToCart(): Promise<void> {
    await this.addButton.click();
  }

  async remove(): Promise<void> {
    await this.removeButton.click();
  }
}
