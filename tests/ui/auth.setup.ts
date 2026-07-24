import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { requireEnv } from '../env';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(requireEnv('SAUCE_USERNAME'), requireEnv('SAUCE_PASSWORD'));

  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: authFile });
});
