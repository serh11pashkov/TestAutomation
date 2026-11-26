import { type Page, type Locator } from '@playwright/test';
import { ProductCard } from '../components/product-card.component';
import { Header } from '../components/header.component';

export class InventoryPage {
  readonly header: Header;
  readonly cards: Locator;
  private readonly sort: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page.locator('.primary_header'));
    this.cards = page.locator('.inventory_item');
    this.sort = page.locator('[data-test="product-sort-container"]');
  }

  async open(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  product(name: string): ProductCard {
    return new ProductCard(this.cards.filter({ hasText: name }));
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sort.selectOption(option);
  }

  async prices(): Promise<number[]> {
    const texts = await this.cards
      .locator('.inventory_item_price')
      .allTextContents();
    return texts.map((t) => Number(t.replace('$', '')));
  }
}
