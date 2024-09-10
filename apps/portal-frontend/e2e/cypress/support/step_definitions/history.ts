import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see a list of historical events for the policy', () => {
  cy.contains('h1', 'History').should('be.visible');
  cy.contains('Upcoming events').scrollIntoView().should('be.visible');
  cy.contains('Completed events').scrollIntoView().should('be.visible');
});
