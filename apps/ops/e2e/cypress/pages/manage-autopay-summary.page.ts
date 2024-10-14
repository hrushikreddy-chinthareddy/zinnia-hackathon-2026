import Page from './page';

class ManageAutoPaySummaryPage extends Page {

    get continueButtonSummaryPage() {
        return cy.get(`[type="button"]`).contains('Continue');
    }

    get submitWithErrorsCheckbox() {
        return cy.get(`input[data-testid="checkbox"]`)
    }

    get submitButton() {
        return cy.get(`button[data-testid="Submit"]`)
    }

//----------------------------------------------------------------------------------------------------------------------- 

    getContinueButtonSummaryPage() {
        this.continueButtonSummaryPage.click();
    }

    selectSubmitWithErrorsCheckbox() {
        this.submitWithErrorsCheckbox.click();
    }

    clickSubmitButton() {
        this.submitButton.click();
    }

}

export default new ManageAutoPaySummaryPage();