import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';
import policyDetailsPage from '../../pages/policy-details.page';

When('I click on Search button', (searchBy: string) => {
  const policyPage = pages['Policy Management page'];

  policyPage.getPolicySearchBy(searchBy).click();
  policyPage['Search input'].clear();
  policyPage['Search button'].click();
});

When('I click on Policy on a Policy card', () => {
  const policyDetailsPage = pages['Policy Details page'];

  policyDetailsPage['Policy link'].click();
});

Then('I should verify all information on Policy Details page', () => {
    //Assert policy details lane element
    cy.contains('Policy Details').should('be.visible');
    cy.contains('Base death benefit').should('be.visible');
    cy.contains('Account value').should('be.visible');
    cy.contains('Net surrender value').should('be.visible');
    cy.contains('Cost basis').should('be.visible');
  
    cy.wait(2000);
})

When('I click on Premiums on Policy Details Page', () => {
  const policyDetailsPage = pages['Policy Details page'];
  cy.intercept('**/eligibilitycheck').as('checkRequests');

  policyDetailsPage['Premiums card'].click();
  cy.wait('@checkRequests');
});

Then('I should see the detailed summary of the policy', () => {
  //Assert policy details lane element
  cy.contains('Policy Details').should('be.visible');
  cy.contains('Base death benefit').should('be.visible');
  cy.contains('Account value').should('be.visible');
  cy.contains('Net surrender value').should('be.visible');
  cy.contains('Cost basis').should('be.visible');
});

When('I navigate to the {string} of a policy', (detail: string) => {
  const policySidebarLink = pages['Policy Details page'].getPolicySidebarLink(detail);
  cy.wait(3000);
  policySidebarLink.click({force:true});
});
