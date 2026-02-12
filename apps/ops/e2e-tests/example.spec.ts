import { test, expect } from '@playwright/test';

test.describe('Case Page', () => {
    test('Loads properly', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.getByRole('link', { name: 'Cases' }).click();

        // Wait for navigation to complete
        await page.waitForURL('**/cases');

        // Wait for case rows to appear - each row has a link to /cases/[id]
        const caseDetailLinks = page.getByRole('link', {
            name: /View case details for case number/i,
        });

        // Wait for at least one case link to appear (with extended timeout)
        await expect(caseDetailLinks.first()).toBeVisible();

        // Now count them
        const linkCount = await caseDetailLinks.count();
        expect(linkCount).toBeGreaterThan(0);
    });
});

test.describe('Policy Page', () => {
    test('Loads properly', async ({ page }) => {
        await page.goto('http://localhost:3000');

        await page.getByRole('link', { name: 'Policies' }).click();

        // Wait for navigation to complete
        await page.waitForURL('**/policies#policySearch');

        // Wait for policy rows to appear - links matching /policies/**/policy/policy-details
        const policyDetailLinks = page.locator(
            'a[href*="/policies/"][href*="/policy/policy-details"]'
        );

        // Wait for at least one policy link to appear (with extended timeout)
        await expect(policyDetailLinks.first()).toBeVisible();
        // Now count them
        const linkCount = await policyDetailLinks.count();
        expect(linkCount).toBeGreaterThan(0);

        // Get the quick action buttons and wait for at least one to be visible
        const quickActionButtons = page
            .getByTestId('policy-action-cell-menu')
            .first();
        await expect(quickActionButtons).toBeVisible();

        await quickActionButtons.click();
        const quickActionMenu = page
            .getByRole('menu')
            .filter({ hasText: 'Send Documents' });
        await expect(quickActionMenu).toBeVisible();

        // Close the menu by clicking outside before navigating
        await page.mouse.click(10, 10);
        await expect(quickActionMenu).toBeHidden();

        await policyDetailLinks.first().click();
        await page.waitForURL('**/policies/**/policy/policy-details');
    });
});

test.describe('Transactions Ops Page ', () => {
    test('Loads properly', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.getByRole('link', { name: 'TransactionOps Suite' }).click();
        await page.waitForURL('**/create-case');

        const transactionOpsHeader = page.getByText('TransactionOps Suite');
        await expect(transactionOpsHeader).toBeVisible();
    });
});

test.describe('Analytics Page ', () => {
    test('Loads properly', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.getByRole('link', { name: 'Analytics' }).click();
        await page.waitForURL('**/analytics/cases');

        const analyticsHeader = page.getByTestId('header-text');
        await expect(analyticsHeader).toBeVisible();
    });
});
