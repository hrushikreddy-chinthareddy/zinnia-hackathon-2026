import Page from '../page';

class OneTimePaymentPayorPage extends Page {
    get continueButtonPayorPage() {
        return cy.get(`button[data-testid="Continue"]`);
    }
    
    get leaveTransactionButtonPayorPage() {
        return cy.get(`button[data-testid="Cancel"]`);
    }

    //-----------------------------------------------------------------------------------------------------------------------

    getPayor() {
        return cy.get(`[data-testid="bank-details-container"]`)
    }

    getContinueButtonPayorPage() {
        this.continueButtonPayorPage.click();
    }

    getLeaveTransactionButtonPayorPage() {
        this.leaveTransactionButtonPayorPage.click();
    }
}

export default new OneTimePaymentPayorPage();
