import Page from '../page';

class WithdrawalStartPage extends Page {

    get withdrawalPage() {
        return cy.get(`[data-testid="bank-details-container"]`).eq(1);
    }

    get startWithdrawalButton() {
        return cy.get(`[data-testid="withdrawal-start-link"]`);
    }

    get continueButtonStartPage() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get leaveTransactionStartPage() {
        return cy.get(`[data-testid="Leave this transaction"]`);
    }

//-----------------------------------------------------------------------------------------------------------------------

    getWithdrawalPage() {
        this.withdrawalPage.click();
    }

    getStartWithdrawalButton() {
        this.startWithdrawalButton.click();
    }

    getContinueButtonStartPage() {
        this.continueButtonStartPage.click();
    }

    getLeaveTransactionStartPage() {
        this.leaveTransactionStartPage.click();
    }

}

export default new WithdrawalStartPage();
