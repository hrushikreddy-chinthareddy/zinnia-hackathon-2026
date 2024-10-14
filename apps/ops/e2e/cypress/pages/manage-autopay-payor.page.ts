import Page from './page';

class ManageAutoPayPayorPage extends Page {
    get continueButtonPayorPage() {
        return cy.get(`button[data-testid="Continue"]`);
    }

    //-----------------------------------------------------------------------------------------------------------------------

    getPayor() {
        return cy.get(`[data-testid="bank-details-container"]`)
    }

    getContinueButtonPayorPage() {
        this.continueButtonPayorPage.click();
    }
}

export default new ManageAutoPayPayorPage();
