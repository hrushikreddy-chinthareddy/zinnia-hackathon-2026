import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';
import updateAutopayPage from '../../pages/manage-autopay-start.page';
import amountPage from '../../pages/manage-autopay-amount.page';
import payorPage from '../../pages/manage-autopay-payor.page';
import paymentPage from '../../pages/manage-autopay-payment.page';
import summaryPage from '../../pages/manage-autopay-summary.page';
import confirmPage from '../../pages/manage-autopay-confirm.page';

Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Minified React error')) {
    return false;
  }
});

Then('I should verify Update Autopay Details on Update Autopay page', () => {
    //Assert Update Autopay details
    cy.contains('Update Premium Autopay').should('be.visible');
    cy.contains('Which document are you working from?').should('be.visible');
 });
 
When('I click Continue button on Update Autopay page', () => {
    updateAutopayPage.getContinueButton();
    cy.wait(2000); 
});

Then('I should see message to select a document to continue on Update Autopay page', () => {
    cy.contains('Select a document (or proceed without) to continue.').should('be.visible');
    cy.wait(2000); 
 });

 When('I select document as {string}', (document) => {
    updateAutopayPage.getDocuments(document);
    cy.wait(2000); 
});

Then('I should see message if I continue without a document selection, we cant update on OnBase for you', () => {
    cy.get(`[data-testid="alert-exclamation-icon"]`).should('be.visible');
    cy.contains(/If you continue without a document selection/).should('be.visible');
 });

Then('I should verify Manage Autopay Amount Details on Amount page', () => {
    //Assert Manage Autopay - Amount details
    // cy.contains('Amount').should('be.visible');
    cy.contains('Premium autopay amount').should('be.visible');
    cy.contains('Payment frequency').should('be.visible');
    cy.contains('Next payment date').should('be.visible');
 });

When('I enter Payment amount {string} on Amount page', (amount) => {
    amountPage.getPaymentAmount(amount);
});

When('I select Payment frequency as {string} on Amount page', (frequency) => {
    amountPage.getPaymentFrequency(frequency);
});

When('I enter Next payment date as {string} on Amount page', (date) => {
    amountPage.getNextPaymentDate(date);
});

When('I enter Next payment date as blank on Amount page', () => {
    amountPage.getBlankNextPaymentDate();
});

When('I click Continue button on Amount page', () => {
    amountPage.getContinueButtonAmountPage();
    cy.wait(2000); 
});

When('I enter blank Payment amount on Amount page', () => {
    amountPage.getBlankPaymentAmount();
});

Then('I should message Payment amount and Next payment date is missing on Amount page', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains(/Premium autopay amount is missing./).should('be.visible');
    cy.contains(/Next payment date is missing./).should('be.visible');
 });


 Then('I should verify Manage Autopay Payor Details on Payor page', () => {
    //Assert Manage Autopay - Payor details
    cy.get('h1').contains('Payor').should('be.visible');
    cy.contains('Select a payor').should('be.visible');
 });

 Then('I should verify Payor tags on Payor page', () => {
    //Assert Manage Autopay - Payor tags
    cy.get(`[class*="p-4"]`).contains('Owner').should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Insured').should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Payor').should('be.visible');
    cy.get(`[class*="p-4"]`).contains('Payee').should('be.visible');
 });


 When('I select a payor on Payor page', () => {
    payorPage.getPayor().click();
    payorPage.getPayor().click();
 });

 When('I click Continue button on Payor page', () => {
    payorPage.getContinueButtonPayorPage();
 });
 
 When('I deselect payor on Payor page', () => {
    payorPage.getPayor().click();
 });

 Then('I should verify message to select a payor', () => {
    cy.get('p').contains(/Select a payor./).should('be.visible');
 });

 Then('I should verify Manage Autopay Payment Details on Payment page', () => {
    //Assert Manage Autopay - Payment details
    cy.get('h1').contains('Payment Method').should('be.visible');
    cy.contains('Bank details').should('be.visible');
 });
 
 When('I select a payment account on Payment page', () => {
    paymentPage.getPaymentAccount().click();
    paymentPage.getPaymentAccount().click();
 });
 
 When('I deselect a payment account {string} on Payment page', (account) => {
    paymentPage.getPaymentAccount().click();
 });

 Then('I should see message to select a bank account to make this payment', () => {
    cy.get(`[data-testid="hex-exclamation-icon"]`).should('be.visible');
    cy.contains(/Select a bank account to make this payment./).should('be.visible');
 });

 When('I click Continue button on Payment page', () => {
    paymentPage.getContinueButtonPaymentPage();
    cy.wait(3000); 
 });

 When('I click Leave transaction button on Payment page', () => {
   paymentPage.getLeaveTransactionPaymentPage();
   cy.wait(3000); 
});


 Then('I should verify Manage Autopay Summary Details', () => {
    //Assert Manage Autopay - Summary details
    cy.get('h1').contains('Summary').should('be.visible');
    cy.get('span').contains('New premium autopay details').should('be.visible');
    cy.get('span').contains('Current').should('be.visible');
    cy.get('span').contains('Next payment date').should('be.visible');
    cy.get('span').contains('Payor').should('be.visible');
    cy.get('span').contains('Banking details').should('be.visible');
 });

 When('I click Leave this transaction', () => {
    updateAutopayPage.getLeaveTransaction();
 });

 Then('I should verify New autopay details on Summary page', () => {
    //Assert Manage Autopay - Summary details
    cy.get('tbody>tr>td').eq(0).should('contain', '$100.00').should('contain', 'New'); 
    cy.get('tbody>tr>td').eq(2).should('contain', 'Quarterly').should('contain', 'New');
    cy.get('tbody>tr>td').eq(4).should('contain', '05/20/2024').should('contain', 'New'); 
    cy.get('tbody>tr>td').eq(6).should('contain', 'Zaharaqa'); 
    cy.get('tbody>tr>td').eq(8).should('contain', 'CITIZEN BANK'); 
 });

 When('I select Submit with Errors checkbox on Summary page', () => {
    summaryPage.selectSubmitWithErrorsCheckbox();
 });

 When('I click Submit button on Summary page', () => {
    summaryPage.clickSubmitButton();
 });

 Then('I should verify submitted confirmation on Confirm page', () => {
    //Assert Manage Autopay - Confirm details
    cy.get('h3').contains('Submitted!').should('be.visible');
    cy.get('p').contains('Zaharaqa').should('be.visible');
    cy.get('p').contains('$100.00').should('be.visible');
    cy.get('p').contains('NIGO processing.').should('be.visible');
 });

//  When('I click on Close button on Confirm page', () => {
//     confirmPage.clickCloseButton();
//  });

 













