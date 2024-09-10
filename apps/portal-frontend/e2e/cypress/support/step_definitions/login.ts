import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import * as envPrefixes from '../../data/persona-env-var-prefixes.json';
import pages from '../../pages/page-factory';

When('I navigate to the Login page', () => {
  pages['Home page']['Continue to sign in'].click();
});

Then('I should see the login form', () => {
  pages['Login page']['Email address input'].should('be.visible');
  pages['Login page']['Email continue button'].should('be.visible');
});

When('I enter valid credentials as {string}', (role: string) => {
  const email = Cypress.env(envPrefixes[role] + '_EMAIL');
  const password = Cypress.env(envPrefixes[role] + '_PASSWORD');

  pages['Login page'].login(email, password);
});

When('I enter invalid credentials', () => {
  const randomId = () => Cypress._.random(0, 1e10);
  const invalidEmail = `invalid-${randomId()}@email.com`;
  pages['Login page'].login(invalidEmail, 'invalidpassword');
});

Then('I should see a login error message', () => {
  pages['Login page']['Login error message'].should('be.visible');
});
