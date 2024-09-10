import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see loan information for the policy', () => {
  cy.contains('h1', 'Loans').should('be.visible');
  cy.contains('Number of loans').should('be.visible');
  cy.contains('Total loan balance').should('be.visible');
  cy.contains('Available loan interest rate').should('be.visible');
  cy.contains('Available loan credit rate').should('be.visible');

  cy.contains('h2', 'Loan Rules').should('be.visible');
  cy.contains('Min loan amount').should('be.visible');
  cy.contains('Max loan amount').should('be.visible');
  cy.contains('Loan interest method').should('be.visible');

  cy.contains('h2', 'Outstanding Loans').should('be.visible');
});
