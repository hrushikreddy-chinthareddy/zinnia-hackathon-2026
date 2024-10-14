import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see information for people on the policy', () => {
  cy.get('h1').contains('People').should('be.visible');
  cy.get('div[role="radiogroup"]').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Owner').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Insured').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Payor').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Payee').should('be.visible');
  cy.get(`[class*="p-4"]`).contains('Primary Beneficiary').should('be.visible');

});
