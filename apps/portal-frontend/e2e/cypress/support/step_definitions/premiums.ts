import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

Then('I should see premium information for the policy', () => {
  // NOTE: For some reason, after the Premiums page loads,
  // the header scrolls out of view. We scroll it into view to validate.
  cy.contains('h1', 'Premiums').scrollIntoView().should('be.visible');
  cy.contains('YTD premium').should('be.visible');
  cy.contains('All-time premium').should('be.visible');
  cy.contains('Cost basis').should('be.visible');
});

When('I click Manage autopay on premiums page', () => {
  const premiumsPage = pages['Premiums page'];
  premiumsPage['Manage autopay link'].click();
});

When('I click One Time Payment on premiums page', () => {
    const premiumsPage = pages['Premiums page'];
    premiumsPage['One Time Payment link'].click();
  });
  
