import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';
import peoplePage from '../../pages/policy/people.page';

Then('I should see information for people on the policy', () => {
  cy.get('h1').contains('People').should('be.visible');
  cy.get('div[role="radiogroup"]').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Owner').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Insured').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Payor').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Payee').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Beneficiary').should('be.visible');
});

Then('I should verify radio for Filter by role on People page', () => {
  cy.get('h1').contains('People').should('be.visible');
  cy.get('div[role="radiogroup"]').should('be.visible').within(() => {
    cy.get(`button[value="All"]`).should('be.visible');
    cy.get(`button[value="OWNER"]`).should('be.visible');
    cy.get(`button[value="INSURED"]`).should('be.visible');
    cy.get(`button[value="PAYOR"]`).should('be.visible');
    cy.get(`button[value="PAYEE"]`).should('be.visible');
    cy.get(`button[value="beneficiary"]`).should('be.visible');
  })
});

When('I click on Filter by Role : {string} on People page', (role) => {
  peoplePage.getFilterByRole(role);
});

Then('I should verify details of bank card', () => {
  cy.get('[data-testid="bank-details-container"]').first().should('be.visible').within(() => {
    cy.get('p').contains('Owner').should('be.visible');
    cy.get('p').contains('Insured').should('be.visible');
    cy.get('p').contains('Payor').should('be.visible');
    cy.get('p').contains('Payee').should('be.visible');
  })
});

Then('I should verify Primary Beneficiary details', () => {
  cy.get('[data-testid="bank-details-container"]').last().should('be.visible').within(() => {
    cy.get('p').contains('Primary Beneficiary').should('be.visible');
  })
});

When('I click on Bank Details card', () => {
  peoplePage.getBankDetailsCard();
  cy.wait(1500);
});

Then('I should verify identification details on People page', () => {
    cy.get('h2').contains('Identification').should('be.visible');
    cy.get('div').contains('Social Security number').should('be.visible');
    cy.get('h2').contains('Phone').should('be.visible');
    cy.get('div').contains('Mobile').should('be.visible');
    cy.get('h2').contains('Email').should('be.visible');
    cy.get('div').contains('Personal').should('be.visible');
    cy.get('h2').contains('Address').should('be.visible');
    cy.get('div').contains('Residential').should('be.visible');
});

When('I click Back Last Page button', () => {
    peoplePage.getBackToLastPageButton();
    cy.wait(1500);
});

When('I click on Primary Beneficiary Details card', () => {
  peoplePage.getBeneficiaryCard();
  cy.wait(1500);
});

Then('I should verify Beneficiary details', () => {
  cy.get('h2').contains('Allocation').should('be.visible');
  cy.get('h2').contains('Identification').should('be.visible');
  cy.get('h2').contains('Phone').should('be.visible');
  cy.get('h2').contains('Email').should('be.visible');

});

