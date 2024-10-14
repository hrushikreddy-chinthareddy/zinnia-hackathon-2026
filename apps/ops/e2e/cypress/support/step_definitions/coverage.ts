import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see the detailed coverage information of the policy', () => {
  cy.get('h1').contains('Coverage').should('be.visible');
  cy.contains('Total gross death benefit').should('be.visible');
  cy.contains('Estimated net death benefit').should('be.visible');
  cy.contains('Death benefit option').should('be.visible');
});
