import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

When('I search by {string} for {string}', (searchBy: string, searchValue: string) => {
  const policyPage = pages['Policy Management page'];
  //cy.intercept('**/en/**').as('navRequests');

  policyPage.getPolicySearchBy(searchBy).click();

  // NOTE: There is flakiness where some letters are not
  // entered correctly. We wait for requests to complete and the page to load.
  // See https://github.com/cypress-io/cypress/issues/3817 for more info.
 // cy.wait('@navRequests');
  cy.wait(3000);
  policyPage['Search input'].type(searchValue);
  policyPage['Search button'].click();
});

Then('I should see a message for a policy not found in Search Result', () => {
  const policyPage = pages['Policy Management page'];

  policyPage['No search results'].within(() => {
    cy.get('svg[class="text-semantic-error"]').should('be.visible');
    cy.get('h3[class*="text-center"]').should('be.visible');
    cy.get('p[class*="text-center"]').should('be.visible');
    cy.get('a[href]').should('be.visible');
  });
});

Then('I should see the policy in Search Results', () => {
  const searchResults = pages['Policy Management page']['Policy search results'];

  /* Assertion: There should be at least one policy card displayed.
     Each card should have elements of the policy within, including:
     - Header
     - Owner Information
     - Policy Summary
     - Find key values
  */
  searchResults.children()
    .should('have.length.gte', 1)
    .each(($card) => {
      cy.wrap($card).get('[data-testid*="Owner Information"]').should('be.visible');
      cy.wrap($card).get('[data-testid*="Policy Summary"]').should('be.visible');
      cy.wrap($card).should('contain', 'Find key values');
    });
});

When('I navigate to the policy details from a Policy Card', () => {
  const policyPage = pages['Policy Management page'];
  policyPage['Policy details link'].click();
});

Then('I should see an error message to enter a policy number', () => {
  const policyPage = pages['Policy Management page'];
  policyPage['Policy search error'].should('be.visible');
});
