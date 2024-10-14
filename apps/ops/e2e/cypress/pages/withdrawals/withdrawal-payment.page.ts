import Page from '../page';

class WithdrawalPaymentPage extends Page {

    get leaveTransactionPaymentPage() {
        return cy.contains('a', 'Leave this transaction');
    }

//----------------------------------------------------------------------------------------------------------------------- 

    getLeaveTransactionPaymentPage() {
        this.leaveTransactionPaymentPage.click();
    }

}

export default new WithdrawalPaymentPage();
