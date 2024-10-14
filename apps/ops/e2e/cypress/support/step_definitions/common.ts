import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import * as envPrefixes from '../../data/persona-env-var-prefixes.json';
import pages from '../../pages/page-factory';
import navigationBar from '../../pages/components/navigation-bar';

Given('User is on the {string}', (pageName: string) => {
  const page = pages[pageName];
  page.open();
});

Then('I should be on the {string}', (pageName: string) => {
  const page = pages[pageName];
  cy.url().should('contain', page.url);
});

When('I logout of Zinnia Live', () => {
  pages['Navigation bar']['User dropdown'].click();
  pages['Navigation bar']['Sign out link'].click();
});

Given('{string} logs into Zinnia Live', (role: string) => {
  const email = Cypress.env(envPrefixes[role] + '_EMAIL');
  const password = Cypress.env(envPrefixes[role] + '_PASSWORD');

  pages['Home page'].open();
  pages['Home page']['Continue to sign in'].click();
  pages['Login page'].login(email, password);
});

When('I click on {string} on the Navigation bar', (navbarLink: string) => {
  pages['Navigation bar'].getNavigationBarLink(navbarLink).click();
});

When('I click logout button', () => {
  navigationBar.getUserDropdownLink();
  navigationBar.getSignOutLink();
});

Then('Ops users navigates to homepage', () => {
  
  pages['Home page']['Continue to sign in'].should('be.visible');
  
})
