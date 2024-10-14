import Page from './page';

class ManageAutoPayAmountPage extends Page {

    get paymentAmount() {
        return cy.get(`input[data-testid="Premium autopay amount"]`);
    }

    get continueButtonAmountPage() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get nextPaymentDate() {
        return cy.get(`input[data-testid="Next payment date"]`);
    }

//----------------------------------------------------------------------------------------------------------------------- 

    getPaymentAmount(amount) {
        this.paymentAmount.clear();
        this.paymentAmount.clear();
        this.paymentAmount.type(amount);
    }

    getBlankPaymentAmount() {
        this.paymentAmount.clear();
    }

    getBlankNextPaymentDate() {
        this.nextPaymentDate.clear();
    }

    getPaymentFrequency(frequency) {
        return cy.get(`input[type="radio"][value="${frequency}"]`).check();
    }

    getNextPaymentDate(date) {
        this.nextPaymentDate.clear();
        this.nextPaymentDate.type(date);
    }

    getContinueButtonAmountPage() {
        this.continueButtonAmountPage.click();
    }

}

export default new ManageAutoPayAmountPage();
