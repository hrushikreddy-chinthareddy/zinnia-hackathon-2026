import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { loginUrlPattern } from './helpers/constants';
const TIMEOUT = 15_000;
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
    // Perform authentication steps. Replace these actions with your own.
    await page.goto('/');
    const signInButton = page.getByRole('button', {
        name: 'Continue to sign in',
    });
    await expect(signInButton).toBeVisible({ timeout: TIMEOUT });
    await Promise.all([page.waitForURL(loginUrlPattern), signInButton.click()]);
    const missingVars = ['E2E_USERNAME', 'E2E_PASSWORD'].filter(
        (v) => !process.env[v]
    );
    if (missingVars.length) {
        const missingVars = ['E2E_USERNAME', 'E2E_PASSWORD'].filter(
            (v) => !process.env[v]
        );
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }
    const signInField = page.getByLabel('Email address');
    await expect(signInField).toBeVisible({ timeout: TIMEOUT });
    await signInField.fill(process.env.E2E_USERNAME as string);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Password').fill(process.env.E2E_PASSWORD as string);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait until the page receives the cookies.
    //
    // Sometimes login flow sets cookies in the process of several redirects.
    // Wait for the final URL to ensure that the cookies are actually set.

    // Alternatively, you can wait until the page reaches a state where all cookies are set.
    await expect(page.getByText('My Tasks')).toBeVisible();
    // Wait for page to be fully loaded to ensure all cookies are set, especially if there are redirects after login.
    await page.waitForLoadState('load');

    // End of authentication steps.

    await page.context().storageState({ path: authFile });
});
