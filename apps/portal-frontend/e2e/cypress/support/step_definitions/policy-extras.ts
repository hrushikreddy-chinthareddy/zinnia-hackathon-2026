import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see extra information for the policy', () => {
  cy.get('h1').contains('Policy Extras').should('be.visible');
  cy.get('div[role="radiogroup"]').should('be.visible');
  cy.get('[data-testid="policy-extras-container-test-id"]').its('length').should('be.greaterThan', 0);
});

