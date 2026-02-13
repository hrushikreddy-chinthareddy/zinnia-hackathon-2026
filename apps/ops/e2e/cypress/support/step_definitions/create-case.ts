/* eslint-disable cypress/no-assigning-return-values */
import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

import pages from '../../pages/page-factory';

When('I navigate to the Create Case page', () => {
    pages['Create Case page'];
});

Then('I should see the detailed filter for case listing', () => {
    cy.contains('Case type').should('be.visible');
    cy.contains('Client').should('be.visible');
    cy.contains('Document ID').should('be.visible');
});

When('I search by case type:{string}, client:{string} and document Id:{string}', (caseType: string, client: string, documentId: string) => {
    const createCasePage = pages['Create Case page'];
    createCasePage.setCaseTypeComboBox(caseType);
    createCasePage.setClientComboBox(client);
    createCasePage.setDocumentIdDate(documentId);
    createCasePage.fireSearch();
});

Then('I should see the cases listed in cards', () => {
    cy.get('[data-testid="case-list-container"]').should('be.visible');
    cy.get('[data-testid="case-search-card"]').its('length').should('be.greaterThan', 0);
});

When('I should see case card should have all expected details', () => {
    cy.get('[data-testid="case-search-card"]').its('length').should('be.greaterThan', 0);

    cy.get('[data-testid="case-search-card-inner-0"]').find('[data-testid="chip-status"]').should('be.visible');    
    cy.get('[data-testid="case-search-card-inner-0"]').contains('Document number').should('be.visible');
    cy.get('[data-testid="case-search-card-inner-0"]').contains('Case id').should('be.visible');
    cy.get('[data-testid="case-search-card-inner-0"]').contains('Policy number').should('be.visible');
    cy.get('[data-testid="case-search-card-inner-0"]').contains('Created').should('be.visible');
    cy.get('[data-testid="case-search-card-inner-0"]').contains('Update').should('be.visible');
});

When('I click to expand case', () => {
    cy.get('[data-testid="case-list-item-0"]').find('button[aria-expanded="false"]').should('be.visible');
    cy.get('[data-testid="case-list-item-0"]').find('button[aria-expanded="false"]').click();
});

Then('I should see the tasks listed for case', () => {
    cy.get('[data-testid="case-list-item-0"]').find('button[aria-expanded="false"]').should('be.visible');
    cy.get('[data-testid="case-list-item-0"]').find('[data-testid="task-list-container"]').should('be.visible');
});

Then('I should see text:{string}', (errorText: string) => {
    cy.contains(errorText).should('be.visible');
});


