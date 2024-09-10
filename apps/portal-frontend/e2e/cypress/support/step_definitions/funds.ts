import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see the detailed fund information of the policy', () => {
  cy.contains('h1', 'Funds').should('be.visible');
  cy.contains('Account value').should('be.visible');
  cy.contains('Total fund value').should('be.visible');

  cy.contains('h2', 'Match').scrollIntoView().should('be.visible');
  cy.contains('Current value').should('be.visible');
  cy.contains('Match rate').should('be.visible');
  cy.contains('Vesting period').should('be.visible');
  cy.contains('Max lifetime match').should('be.visible');

  cy.contains('h2', 'Fund Details').scrollIntoView().should('be.visible');
  cy.contains('Holding Funds').should('be.visible');
  cy.contains('Elected Funds').should('be.visible');
  cy.contains('Fund allocation').should('be.visible');
  cy.contains('Fund name').should('be.visible');
  cy.contains('Type').should('be.visible');
  cy.contains('Interest rate').should('be.visible');
  cy.contains('Fund value').should('be.visible');
  cy.contains('Allocation').should('be.visible');
  cy.contains('Not Elected Funds').should('be.visible');
});
