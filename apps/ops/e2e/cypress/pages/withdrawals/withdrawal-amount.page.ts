import Page from '../page';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

class WithdrawalAmountPage extends Page {

    get startWithdrawalButton() {
        return cy.get(`a[href*="new-withdrawal"]`).first();
    }

    get continueButtonStartPage() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get leaveTransactionStartPage() {
        return cy.get(`[data-testid="Cancel"]`);
    }

    get effectiveDate() {
        return cy.get(`[data-testid="field-input-test-id"]`).first();
    }

    get continueButtonAmountPage() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get disbursementBox() {
        return cy.get(`[role="combobox"]`);
    }

    get customAmountTextBox() {
        return cy.get(`[data-testid="field-input-test-id"]`).eq(1);
    }

    get fundDisbursementType() {
        return cy.get(`[type="radio"][tabindex="-1"]`);
    }

    get leaveTransactionAmountPage() {
        return cy.get(`[data-testid="Leave this transaction"]`);
    }

//-----------------------------------------------------------------------------------------------------------------------

    getStartWithdrawalButton() {
        this.startWithdrawalButton.click();
    }

    getContinueButtonStartPage() {
        this.continueButtonStartPage.click();
    }

    getLeaveTransactionStartPage() {
        this.leaveTransactionStartPage.click();
    }

    getDistributionType(type) {
        return cy.get(`[data-label*="${type}"]`).click();
    }

    getCurrentEffectiveDate() {
        const currentDate = dayjs().format('L');
        this.effectiveDate.type(currentDate);
    }

    getEffectiveDate(date) {
        this.effectiveDate.clear();
        this.effectiveDate.type(date);
    }

    getContinueButtonAmountPage() {
        this.continueButtonAmountPage.click();
    }

    getDisbursementType(type) {
        this.disbursementBox.click();
        return cy.contains('p',type).click();
    }

    getWithdrawalTypeCustom() {
        return cy.get(`[id="radio-undefined-0"]`).click();
    }

    getWithdrawalTypeMaximum() {
        return cy.get(`[id="radio-undefined-1"]`).click();
    }

    getCustomAmount(amount) {
        this.customAmountTextBox.type(amount);
    }

    getFundDisbursementTypeProRata() {
        this.fundDisbursementType.first().click();
    }

    getLeaveTransactionAmountPage() {
        this.leaveTransactionAmountPage.click();
    }

}

export default new WithdrawalAmountPage();
