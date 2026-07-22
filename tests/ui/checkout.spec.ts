import { test, expect } from '@playwright/test';
import { CheckoutPage } from './pages/CheckoutPage';
import { checkoutCustomer, product } from './checkout.data';

test.describe('Checkout: a logged-in shopper adds a product to their cart and completes checkout', () => {
  test('an authenticated shopper buys a product from start to order confirmation', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    await test.step('Land on the Inventory page as an already logged-in shopper', async () => {
      await page.goto('/inventory.html');

      await test.step('Expect the Inventory page to be displayed', async () => {
        await expect(page).toHaveURL(/inventory\.html/);
      });
    });

    await test.step('Add a product to the cart', async () => {
      await checkoutPage.addProductToCart(product.slug);

      await test.step('Expect the cart icon to show 1 item', async () => {
        await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      });
    });

    await test.step('Open the cart', async () => {
      await page.getByTestId('shopping-cart-link').click();

      await test.step('Expect the added product to be listed in the cart', async () => {
        await expect(page.getByTestId('inventory-item-name')).toHaveText(product.name);
      });
    });

    await test.step("Complete checkout with the shopper's information", async () => {
      await checkoutPage.checkout(checkoutCustomer);

      await test.step('Expect the order to be confirmed with a thank-you message', async () => {
        await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
      });
    });
  });
});
