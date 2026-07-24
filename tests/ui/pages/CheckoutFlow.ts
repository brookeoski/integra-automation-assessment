import { Page } from '@playwright/test';
import { CustomerInfo } from '../checkout.data';

export class CheckoutFlow {
  constructor(private readonly page: Page) {}

  async addProductToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click();
  }

  async checkout(customer: CustomerInfo) {
    await this.page.getByTestId('checkout').click();
    await this.page.getByTestId('firstName').fill(customer.firstName);
    await this.page.getByTestId('lastName').fill(customer.lastName);
    await this.page.getByTestId('postalCode').fill(customer.postalCode);
    await this.page.getByTestId('continue').click();
    await this.page.getByTestId('finish').click();
  }
}
