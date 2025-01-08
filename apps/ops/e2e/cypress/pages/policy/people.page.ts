import Page from '../page';

class PeoplePage extends Page {
  url = '/people';

  get bankDetailsCard() {
    return cy.get(`[data-testid="bank-details-container"]`);
  }

  get backToLastPageButton() {
    return cy.get(`p[id="breadcrumb-text"]`);
  }

//-----------------------------------------------------------------------------------------------------------------------

  getFilterByRole(role) {
    cy.get(`button[value="${role}"]`).click();
  }

  getBankDetailsCard() {
    this.bankDetailsCard.first().click();
  }

  getBeneficiaryCard() {
    this.bankDetailsCard.last().click();

  }

  getBackToLastPageButton() {
    this.backToLastPageButton.click();
  }
}

export default new PeoplePage();
