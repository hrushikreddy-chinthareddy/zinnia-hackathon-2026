import Page from './page';

class ManageAutoPayPaymentPage extends Page {

    get continueButtonPaymentPage() {
        return cy.get(`[type="button"]`).contains('Continue');
    }

    get leaveTransactionPaymentPage() {
        return cy.get(`[data-testid="leave-transaction"]`);
    }

//----------------------------------------------------------------------------------------------------------------------- 


    getContinueButtonPaymentPage() {
        this.continueButtonPaymentPage.click();
    }

    getLeaveTransactionPaymentPage() {
        this.leaveTransactionPaymentPage.click();
    }

    getPaymentAccount() {
        return cy.get(`[data-testid="bank-details-container"]`);
    }

}

export default new ManageAutoPayPaymentPage();