import Page from '../page';

class OneTimePaymentSummaryPage extends Page {

    get continueButtonSummaryPage() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get leaveTransactionSummaryPage() {
        return cy.get(`[data-testid="Cancel"]`);
    }

    get bankDetails() {
        return cy.get(`[data-testid="bank-details-container"]`);
    }

//----------------------------------------------------------------------------------------------------------------------- 


    getContinueButtonSummaryPage() {
        this.continueButtonSummaryPage.click();
    }

    getLeaveTransactionSummaryPage() {
        this.leaveTransactionSummaryPage.click();
    }

    getBankDetails() {
        this.bankDetails.click();
    }

}

export default new OneTimePaymentSummaryPage();