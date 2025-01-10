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

    get clickPolicySearchDropdown() {
      // return cy.get('button[id="radix-:r2h:"]');
      return cy.get('label[id="case-search-label"]');
    }

    get firstNameTextBox() {
      return cy.get('[placeholder="First name"]');
    }

    get lastNameTextBox() {
      return cy.get('[placeholder="Last name"]');
    }

    getPolicySidebarLink(policySubLink: string) {
      return cy.get('[data-testid="drawer-details-drawer-test-id').contains('span', policySubLink);
    }

    // getclickPolicySearchDropdown() {
    //   return cy.get('[data-testid="button-group-label-test-id-Policy Number"]');
    // }

    getPolicyNumber(policyNumber) {
    this.policyNumberTextBox.type(policyNumber);
    }

    getClickPolicySearchDropdown() {
    this.clickPolicySearchDropdown.click();
    }

  getPolicySearchBy(searchBy) {
    //return cy.get(`[data-testid="button-group-label-test-id-${searchBy}"]`);
    return cy.get('p').contains(searchBy);
    }

  getSearchText(searchText) {
    return cy.get(`[placeholder="Policy number"]`).type(searchText,{force: true});
    }

  getSearchTextByFirstName(firstName){
    this.firstNameTextBox.type(firstName);
  }

  getSeachTextByLastName(lastName){
    this.lastNameTextBox.type(lastName);
  }

}
export default new PolicyDetailsPage();
