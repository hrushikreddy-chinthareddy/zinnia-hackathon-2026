import Page from '../page';

class WithdrawalPayeePage extends Page {

    get continueButtonPayeePage() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get leaveTransactionPayeePage() {
        return cy.get(`[data-testid="Cancel"]`);
    }

    get selectPayee() {
        return cy.get(`[data-testid="bank-details-container"]`).first();
    }

//----------------------------------------------------------------------------------------------------------------------- 

    getContinueButtonPayeePage() {
        this.continueButtonPayeePage.click();
    }

    getLeaveTransactionPayeePage() {
        this.leaveTransactionPayeePage.click();
    }

    getPayee() {    
        this.selectPayee.click();
    }
}

export default new WithdrawalPayeePage();
