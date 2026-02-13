import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import dayjs from 'dayjs';

import onetimepaymentAmountPage from '../../pages/onetimepayment/onetimepayment-amount.page';
import onetimePaymentMethodPage from '../../pages/onetimepayment/onetimepayment-paymentmethod.page';
import onetimepaymentPayorPage from '../../pages/onetimepayment/onetimepayment-payor.page';
import oneTimePaymentStartPage from '../../pages/onetimepayment/onetimepayment-start.page';
import onetimePaymentSummaryPage from '../../pages/onetimepayment/onetimepayment-summary.page';

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


Then('I should verify Payor information on One Time Payor page', () => {
    //Assert Manage Autopay - Payor details
    cy.get('h1').contains('Payor').should('be.visible');
    cy.contains('Select a payor').should('be.visible');
    cy.get('p').contains('Owner').should('be.visible');
    cy.get('p').contains('Insured').should('be.visible');
    cy.get('p').contains('Payor').should('be.visible');
    cy.get('p').contains('Payee').should('be.visible');
 });

 When('I select a payor on One Time Payment Payor page', () => {
    onetimepaymentPayorPage.getPayor().click();
    onetimepaymentPayorPage.getPayor().click();
 });

 When('I deselect a payor on One Time Payor page', () => {
    onetimepaymentPayorPage.getPayor().click();
 });

 When('I click Continue button on One Time Payment Payor page', () => {
    onetimepaymentPayorPage.getContinueButtonPayorPage();
 });

 When('I click Leave Transaction button on One Time Payment Payor page', () => {
    onetimepaymentPayorPage.getLeaveTransactionButtonPayorPage();
 });

 Then('I should verify One Time Payment Details on One Time Payment method page', () => {
    cy.get('h1').contains('Payment Method').should('be.visible');
    cy.get('label').contains('Bank details').should('be.visible');
    cy.get('span').contains('Checking account').should('be.visible');
    cy.get('div').contains('Account number').should('be.visible');
 });

 Then('I should verify message to select a payor on Payor page', () => {
    cy.get('p').contains(/Select a payor./).should('be.visible');
 });

Then('I should verify One Time Payment Details on One Time Payment page', () => {
    //Assert Manage Autopay - Payment details
    cy.get('h1').contains('Payment Method').should('be.visible');
    cy.contains('Bank details').should('be.visible');
    cy.get('span').contains('Checking account').should('be.visible');
    cy.get('div').contains('Account number').should('be.visible');
 });

 When('I select bank details on One Time Payment page', () => {
    onetimePaymentMethodPage.getBankDetails();
    onetimePaymentMethodPage.getBankDetails();
 });

 When('I deselect a payment account on One Time Payment page', () => {
    onetimePaymentMethodPage.getBankDetails();
 });


 When('I click Continue button on One Time Payment page', () => {
    onetimePaymentMethodPage.getContinueButtonPaymentPage();
    cy.wait(3000);
 });

 When('I click Leave transaction button on One Time Payment page', () => {
    onetimePaymentMethodPage.getLeaveTransactionPaymentPage();
    cy.wait(3000);
 });

 Then('I should verify One Time Payment Summary Details', () => {
    //Assert One Time Payment - Summary details
    cy.get('h1').contains('Summary').should('be.visible');
    cy.get('h2').contains('Payor').should('be.visible');
    cy.get('div').contains('Premium payment amount').should('be.visible');
    cy.get('div').contains('Effective date').should('be.visible');
    cy.get('h4').contains('Payment method').should('be.visible');
 });

 Then('I should verify Summary premium payment amount details', () => {
   cy.get('h1').contains('Summary').should('be.visible');
   cy.get('div').contains('Premium payment amount').should('be.visible');
   cy.get('span').contains('$100.00').should('be.visible');
});

Then('I should verify Summary Effective date details', () => {
   cy.get('h1').contains('Summary').should('be.visible');
   cy.get('div').contains('Effective date').should('be.visible');
   const currentDate = dayjs().format('l');
   cy.get('span').should('contain', currentDate);
});

Then('I should verify Payor details on Summary page', () => {
   cy.get('h2').contains('Payor').should('be.visible');
   cy.get('span').contains('Karen A. Bates-tc28').should('be.visible');
   cy.get('h4').contains('Payment method').should('be.visible');
   cy.get('span').contains('JPMORGAN CHASE').should('be.visible');
});

When('I click Continue button on Summary page', () => {
   onetimePaymentSummaryPage.getContinueButtonSummaryPage();
   cy.wait(3000);
});

Then('I should verify Confirm page details', () => {
   cy.get('h3').contains('Submitted!').should('be.visible');
   cy.get('span').contains('$100.00').should('be.visible');
});





