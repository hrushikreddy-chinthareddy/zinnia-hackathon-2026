import dayjs from 'dayjs';

import Page from '../page';

class OneTimePaymentAmountPage extends Page {

    get continueButton() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get leaveTransaction() {
        return cy.get(`[data-testid="Leave this transaction"]`);
    }

    get effectiveDate() {
        return cy.get(`[data-testid="field-input-test-id"]`).first();
    }

    get paymentAmount() {
        return cy.get(`[data-testid="field-input-test-id"]`).eq(1);
    }

//-----------------------------------------------------------------------------------------------------------------------

    getContinueButton() {
        this.continueButton.click();
    }

    getDocuments(document) {
        return cy.get(`[data-testid="${document}"]`).click();
    }

    getLeaveTransaction() {
        this.leaveTransaction.click();
    }

    getCurrentEffectiveDate() {
        const currentDate = dayjs().format('L');
        this.effectiveDate.type(currentDate);
    }

    getPaymentAmount(amount) {
        this.paymentAmount.clear();
        this.paymentAmount.type(amount);
    }
}

export default new OneTimePaymentAmountPage();
