import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('/');
    const signInButton = page.getByRole('button', {
        name: 'Continue to sign in',
    });
    if (await signInButton.isVisible()) {
        await signInButton.click();
    }
    const signInField = page.getByLabel('Email address');
    await expect(signInField).toBeVisible();
    await signInField.fill(process.env.E2E_USERNAME!);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait until the page receives the cookies.
    //
    // Sometimes login flow sets cookies in the process of several redirects.
    // Wait for the final URL to ensure that the cookies are actually set.

    // Alternatively, you can wait until the page reaches a state where all cookies are set.
    await expect(page.getByText('My Tasks')).toBeVisible();
    // Wait for loader to disappear
    await page.waitForLoadState('networkidle');

    // End of authentication steps.

    await page.context().storageState({ path: authFile });
});
