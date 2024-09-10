import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';
import oneTimePaymentStartPage from '../../pages/onetimepayment/onetimepayment-start.page';
import onetimepaymentAmountPage from '../../pages/onetimepayment/onetimepayment-amount.page';

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error')) {
    return false;
  }
});

Then('I should verify Start page Details on one time payment start page', () => {
    cy.contains('Make a Premium Payment').should('be.visible');
    cy.contains('Which document are you working from?').should('be.visible');
 });


When('I click Continue button on One Time Payment Start page', () => {
    oneTimePaymentStartPage.getContinueButton();
    cy.wait(2000); 
});

When('I click Leave Transaction button on One Time Payment Start page', () => {
    oneTimePaymentStartPage.getLeaveTransaction();
    cy.wait(2000); 
});

Then('I should see message to select a document to continue on One Time Payment page', () => {
    cy.contains('Select a document (or proceed without) to continue.').should('be.visible');
    cy.wait(2000); 
 });

When('I select document as {string} on One Time Payment Start page', (document) => {
    oneTimePaymentStartPage.getDocuments(document);
    cy.wait(2000); 
});

Then('I should verify Amount page details on One Time Payment Amount page', () => {
    cy.get('h1').contains('Amount').should('be.visible');
    cy.contains('Effective date').should('be.visible');
    cy.contains('Premium payment amount').should('be.visible'); 
});

When('I enter Effective date on One Time payment Amount page', () => {
    onetimepaymentAmountPage.getCurrentEffectiveDate();
});

When('I enter Premium payment Amount as {string} on One Time payment Amount page', (amount) => {
    onetimepaymentAmountPage.getPaymentAmount(amount);
});

When('I click Leave Transaction button on One Time payment Amount page', () => {
    onetimepaymentAmountPage.getLeaveTransaction();
});

When('I click Continue button on One Time payment Amount page', () => {
    onetimepaymentAmountPage.getContinueButton();
});

Then('I should verify message for Premium payment amount is missing', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains(/Premium payment amount is missing/).should('be.visible');
});
