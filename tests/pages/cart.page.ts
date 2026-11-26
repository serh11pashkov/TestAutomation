import { type Page, type Locator } from '@playwright/test';
import { Header } from '../components/header.component';

export class CartPage {
  readonly header: Header;
  readonly items: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page.locator('.primary_header'));
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', {
      name: 'Continue Shopping',
    });
  }

  async open(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  itemByName(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  async removeItem(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
