import Page from '../page';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

class WithdrawalTaxesPage extends Page {

    get taxPercentage() {
        return cy.get(`[data-testid="field-input-test-id"]`);
    }

    get taxDollars() {
        return cy.get(`[data-testid="field-input-test-id"]`);
    }

    get continueButton() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get checkbox() {
        return cy.get(`[data-testid="checkbox"]`);
    }

    get leaveTransactionTaxesPage() {
        return cy.get(`[data-testid="Leave this transaction"]`);
    }

//-----------------------------------------------------------------------------------------------------------------------

    getFederalTaxPercentage(taxPercentage) {
        this.taxPercentage.first().type(taxPercentage);
    }

    getFederalTaxDollars(dollarAmount) {
        this.taxDollars.eq(1).type(dollarAmount);
    }

    getContinueButton() {
        this.continueButton.click();
    }

    getWithholdMinFederalCheckbox() {
        this.checkbox.first().click();
    }

    getDoNotWithholdFederalCheckbox() {
        this.checkbox.eq(1).click();
    }

    getStateTaxPercentage(taxPercentage) {
        this.taxPercentage.eq(2).type(taxPercentage);
    }

    getStateTaxDollars(dollarAmount) {
        this.taxDollars.eq(3).type(dollarAmount);
    }

    getWithholdMinStateCheckbox() {
        this.checkbox.eq(2).click();
    }

    getDoNotWithholdStateCheckbox() {
        this.checkbox.eq(3).click();
    }

    getLeaveTransactionTaxesPage() {
        this.leaveTransactionTaxesPage.click();
    }

}

export default new WithdrawalTaxesPage();
