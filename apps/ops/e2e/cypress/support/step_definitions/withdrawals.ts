import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';
import withdrawalStartPage from '../../pages/withdrawals/withdrawal-start.page';
import withdrawalAmountPage from '../../pages/withdrawals/withdrawal-amount.page';
import withdrawalTaxesPage from '../../pages/withdrawals/withdrawal-taxes.page';
import withdrawalPayeePage from '../../pages/withdrawals/withdrawal-payee.page';
import withdrawalPaymentPage from '../../pages/withdrawals/withdrawal-payment.page';
import withdrawalSummaryPage from '../../pages/withdrawals/withdrawal-summary.page';

Then('I should see withdrawal information for the policy', () => {
    cy.contains('h1', 'Withdrawals').should('be.visible');
    cy.get(`[data-testid="badge-test-id"]`).contains('Eligible').should('be.visible');
    cy.contains('Eligible for withdrawal').should('be.visible');
    cy.contains('Net surrender value').should('be.visible');
    cy.contains('Annual withdrawals remaining').should('be.visible');
    cy.contains('All-time withdrawals').should('be.visible');

    cy.contains('h2', 'Withdrawal Rules').should('be.visible');
    cy.contains('Min withdrawal amount').should('be.visible');
    cy.contains('Max withdrawal amount').should('be.visible');
    cy.contains('Max annual withdrawals').scrollIntoView().should('be.visible');
    cy.contains('Coverage preservation limit').scrollIntoView().should('be.visible');
});

When('I click on Withdrawals on Policy Details Page', () => {
    withdrawalStartPage.getWithdrawalPage();
});

When('I click on Start a Withdrawal on Withdrawals page', () => {
    withdrawalStartPage.getStartWithdrawalButton();
});

Then('I should see Start a Withdrawal details on Withdrawal Start page', () => {
    cy.contains('h1', 'Start a Withdrawal').should('be.visible');
    cy.contains('Which document are you working from?').should('be.visible');
});

Then('I should see a message to select a document to continue', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains('p', 'Select a document (or proceed without) to continue.').should('be.visible');
});

When('I click on Continue button on Withdrawal Start page', () => {
    withdrawalStartPage.getContinueButtonStartPage();
});

When('I click Leave this transaction on Withdrawal Start page', () => {
    withdrawalStartPage.getLeaveTransactionStartPage();
});

Then('I verify all information on Amount page', () => {
    cy.contains('h1', 'Amount').should('be.visible');
    cy.contains('What type of withdrawal is this?').should('be.visible');
    cy.contains('Distribution type').should('be.visible');
});

When('I click on Distribution type {string} on Amount page', type => {
    withdrawalAmountPage.getDistributionType(type);
});

Then('I should see message a full withdrawal will end the owners coverage', () => {
    cy.contains(/A full withdrawal will end the owner's coverage./).should('be.visible');
});

When('I enter Effective date on Amount page', () => {
    withdrawalAmountPage.getCurrentEffectiveDate();
});

When('I enter Effective date {string} on Amount page', date => {
    withdrawalAmountPage.getEffectiveDate(date);
});

When('I click on Continue button on Amount page', () => {
    withdrawalAmountPage.getContinueButtonAmountPage();
});

When('I Disbursement type {string} on Amount page', (type) => {
    withdrawalAmountPage.getDisbursementType(type);
});

When('I select withdrawal as Custom amount on Amount page', () => {
    withdrawalAmountPage.getWithdrawalTypeCustom();
});

When('I select withdrawal as Maximum amount on Amount page', () => {
    withdrawalAmountPage.getWithdrawalTypeMaximum();
});

When('I enter custom amount {string} on Amount page', amount => {
    withdrawalAmountPage.getCustomAmount(amount);
});

When('I select Fund Disbursement type Pro rata on Amount page', () => {
    withdrawalAmountPage.getFundDisbursementTypeProRata();
});

When('I click on Leave this transaction on Amount page', () => {
    withdrawalAmountPage.getLeaveTransactionAmountPage();
});

Then('I verify all information on Taxes page', () => {
    cy.contains('h1', 'Taxes').should('be.visible');
    cy.contains(/How much should we withhold for taxes/).should('be.visible');
    cy.contains('Federal tax').should('be.visible');
    cy.contains('State tax (VT)').should('be.visible');
});

When('I enter Federal tax as {string} percentage on Taxes page', taxPercentage => {
    withdrawalTaxesPage.getFederalTaxPercentage(taxPercentage);
});

When('I click Continue button on Taxes page', () => {
    withdrawalTaxesPage.getContinueButton();
});

Then('I should a message for Tax withholding details are missing', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains('p', 'Tax withholding details are missing.').should('be.visible');
});

When('I enter Dollar Amount as {string} for Federal tax', dollarAmount => {
    withdrawalTaxesPage.getFederalTaxDollars(dollarAmount);
});

Then('I should a message to enter either % or $ amount', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains('p', 'Enter either % amount or $ amount.').should('be.visible');
});

When('I click Withhold minimum required federal tax checkbox on Taxes page', () => {
    withdrawalTaxesPage.getWithholdMinFederalCheckbox();
});

When('I click Do not withhold federal tax checkbox on Taxes page', () => {
    withdrawalTaxesPage.getDoNotWithholdFederalCheckbox();
});

Then('I should see a message to select either minimum withholding or no withholding and tax withholding details are missing', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains('p', 'Select either minimum withholding or no withholding.').should('be.visible');
    cy.contains('p', 'Tax withholding details are missing.').should('be.visible');
});

When('I enter State tax as {string} percentage on Taxes page', taxPercentage => {
    withdrawalTaxesPage.getStateTaxPercentage(taxPercentage);
});

When('I enter Dollar Amount as {string} for State tax', dollarAmount => {
    withdrawalTaxesPage.getStateTaxDollars(dollarAmount);
});

When('I click Withhold minimum required state tax checkbox on Taxes page', () => {
    withdrawalTaxesPage.getWithholdMinStateCheckbox();
});

When('I click Do not withhold state tax checkbox on Taxes page', () => {
    withdrawalTaxesPage.getDoNotWithholdStateCheckbox();
});

When('I click Leave this transaction on Taxes page', () => {
    withdrawalTaxesPage.getLeaveTransactionTaxesPage();
});

Then('I should verify all information on Payee page', () => {
    cy.contains('h1', 'Payees').should('be.visible');
    cy.contains(/Who should the payment go to/).should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Owner').should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Insured').should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Payor').should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Payee').should('be.visible');
});

When('I select a payee on Payee page', () => {
    withdrawalPayeePage.getPayee();
});

When('I click Continue button on Payee page', () => {
    withdrawalPayeePage.getContinueButtonPayeePage();
});

Then('I should verify all information on Payment Method page', () => {
    cy.contains('h1', 'Payment Method').should('be.visible');
    cy.contains(/Where should we send the payment/).should('be.visible');
    cy.contains('label', 'Bank details').should('be.visible');
});

When('I click on Leave this transaction on Payment page', () => {
    withdrawalPaymentPage.getLeaveTransactionPaymentPage();
});

Then('I should verify headers information on Summary page', () => {
    cy.contains('h1', 'Summary').should('be.visible');
    cy.contains('div', 'Effective date').should('be.visible');
    cy.contains('div', 'Requested withdrawal amount').should('be.visible');
    cy.contains('div', 'Total payment').should('be.visible');
    cy.contains('div', 'Withdrawal type').should('be.visible');
    cy.contains('div', 'Fund disbursement type').should('be.visible');
    cy.contains('h2', 'Taxes').should('be.visible');
    cy.contains('div', 'Federal tax').should('be.visible');
    cy.contains('div', 'State tax (VT)').should('be.visible');

    cy.contains('h2', 'Payee').should('be.visible');
});

Then('I should verify Summary details', () => {
    cy.get('span').should('contain', '7/15/2024').should('be.visible');
    cy.get('p').should('contain', 'Surrender').should('be.visible');
    cy.get('p').should('contain', 'Pro rata').should('be.visible');
});

Then('I should verify Taxes details on Summary page', () => {
    cy.get('p').should('contain', 'Min required (10%)');
    cy.get('p').should('contain', 'Min required');
});
