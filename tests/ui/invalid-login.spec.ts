import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

// Login itself is under test here, so this opts out of the project's saved
// authenticated state rather than starting from an already logged-in session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login: a shopper cannot access the store with the wrong password', () => {
  test('TC_UI_004 - a valid username with an incorrect password is rejected with an error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Attempt to log in with a valid username and an incorrect password', async () => {
      await loginPage.login(process.env.SAUCE_USERNAME!, 'wrong_password');

      await test.step('Expect an error message to be shown and the shopper to remain on the login page', async () => {
        await expect(page.getByTestId('error')).toHaveText(
          'Epic sadface: Username and password do not match any user in this service'
        );
        await expect(page).not.toHaveURL(/inventory\.html/);
      });
    });
  });
});
