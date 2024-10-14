import Page from '../../page';

class PolicyDetailsPage extends Page {
  url = '/policy/policy-details';

  get policyNumberTextBox() {
    return cy.get('[data-testid="field-input-test-id"]');
  }

  get ['Policy link']() {
    return cy.get('a[data-testid="Policy"]');
  }

  get ['Premiums card']() {
   return cy.get('[data-testid="bank-details-container"]').first(); 
  }

  getPolicySidebarLink(policySubLink: string) {
    return cy.get('[data-testid="drawer-details-drawer-test-id').contains('span', policySubLink);
  }

// ------------------------------------------------------------------------

  getPolicyNumber(policyNumber) {
   this.policyNumberTextBox.type(policyNumber);
  }

}

export default new PolicyDetailsPage();
