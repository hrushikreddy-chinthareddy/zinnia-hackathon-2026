import { test, expect } from '@playwright/test';

const TIMEOUT = 15_000;

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
        await expect(caseDetailLinks.first()).toBeVisible({ timeout: TIMEOUT });

        // Now count them
        const linkCount = await caseDetailLinks.count();
        expect(linkCount).toBeGreaterThan(0);
    });
});

test.describe('Policy Page', () => {
    test('loads page, opens quick action menu, and navigates to policy details', async ({
        page,
    }) => {
        await page.goto('http://localhost:3000');

        await page.getByRole('link', { name: 'Policies' }).click();

        // Wait for navigation to complete
        await page.waitForURL('**/policies#policySearch');

        // Wait for policy rows to appear - links matching /policies/**/policy/policy-details
        const policyDetailLinks = page.locator(
            'a[href*="/policies/"][href*="/policy/policy-details"]'
        );

        // Wait for at least one policy link to appear (with extended timeout)
        await expect(policyDetailLinks.first()).toBeVisible({
            timeout: TIMEOUT,
        });
        // Now count them
        const linkCount = await policyDetailLinks.count();
        expect(linkCount).toBeGreaterThan(0);

        // Get the quick action buttons and wait for at least one to be visible
        const quickActionButton = page
            .getByTestId('policy-action-cell-menu')
            .first();
        await expect(quickActionButton).toBeVisible({ timeout: TIMEOUT });

        await quickActionButton.click();
        const quickActionMenu = page
            .locator('[role="menu"][data-state="open"]')
            .filter({ hasText: 'Send Documents' });
        await expect(quickActionMenu).toBeVisible({ timeout: TIMEOUT });

        // Close the menu by clicking the trigger again
        await quickActionButton.click();
        await expect(quickActionMenu).toHaveCount(0, { timeout: TIMEOUT });

        // Synchronize click and navigation to avoid race conditions
        await Promise.all([
            policyDetailLinks.first().click(),
            page.waitForURL('**/policies/**/policy/policy-details', {
                timeout: TIMEOUT,
            }),
        ]);
        await page.waitForURL('**/policies/**/policy/policy-details', {
            timeout: TIMEOUT,
        });
        await expect(
            page.getByRole('heading', {
                name: /(Policy|Contract)\s+Details/,
            })
        ).toBeVisible({ timeout: TIMEOUT });
    });
});

test.describe('Transactions Ops Page ', () => {
    test('Loads properly', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.getByRole('link', { name: 'TransactionOps Suite' }).click();
        await page.waitForURL('**/create-case');

        const transactionOpsHeader = page.getByRole('heading', {
            name: 'Transaction Ops Suite',
        });
        await expect(transactionOpsHeader).toBeVisible({ timeout: TIMEOUT });
    });
});

test.describe('Analytics Page ', () => {
    test('Loads properly', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.getByRole('link', { name: 'Analytics' }).click();
        await page.waitForURL('**/analytics/cases');

        const analyticsHeader = page.getByTestId('header-text');
        await expect(analyticsHeader).toBeVisible({ timeout: TIMEOUT });
    });
});
