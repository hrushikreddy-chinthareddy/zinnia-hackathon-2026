import Page from '../page';

class OneTimePaymentMethodPage extends Page {

    get continueButtonPaymentPage() {
        return cy.get(`[data-testid="continue-button"]`);
    }

    get leaveTransactionPaymentPage() {
        return cy.get(`[data-testid="leave-transaction"]`);
    }

    get bankDetails() {
        return cy.get(`[data-testid="bank-details-container"]`);
    }

//----------------------------------------------------------------------------------------------------------------------- 


    getContinueButtonPaymentPage() {
        this.continueButtonPaymentPage.click();
    }

    getLeaveTransactionPaymentPage() {
        this.leaveTransactionPaymentPage.click();
    }

    getBankDetails() {
        this.bankDetails.click();
    }

}

export default new OneTimePaymentMethodPage();