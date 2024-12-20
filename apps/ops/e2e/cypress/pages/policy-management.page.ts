import Page from './page';

class PolicyManagementPage extends Page {
    url = '/policies';

    getPolicySearchBy(searchBy: string) {
      return cy.get(`[data-testid="button-group-label-test-id-${searchBy}"]`);
    }

    get ['Search input']() {
      return cy.get('[data-testid="field-input-test-id"]').find('input');
    }

    get ['Search button']() {
      return cy.get('button[data-testid="search-btn"]');
    }

    get ['No search results']() {
      return cy.get('[class="prose"]').within(() => {
        cy.get('article');
      });
    }

    get ['Policy search results']() {
      return cy.get('[data-testid="card-details-card-test-id"]');
    }

    get ['Policy details link']() {
      // This gets the Policy details link for the first policy card
      return cy.get('[data-testid="quick-links"]').contains('a','Policy');
    }

    get ['Policy search error']() {
      return cy.get('p').contains('Enter a policy number to return search results');
    }
}

export default new PolicyManagementPage();
