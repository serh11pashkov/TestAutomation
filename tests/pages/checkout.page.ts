import { type Page, type Locator } from '@playwright/test';
import { type Customer } from '../data/factories';

export class CheckoutPage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  readonly error: Locator;
  readonly overviewTitle: Locator;
  readonly completeHeader: Locator;
  readonly summaryTotal: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    this.error = page.locator('[data-test="error"]');
    this.overviewTitle = page.getByText('Checkout: Overview');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.summaryTotal = page.locator('.summary_total_label');
  }

  async fillCustomer(customer: Customer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
    await this.continueButton.click();
  }

  async fillLastNameAndContinue(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
    await this.continueButton.click();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
