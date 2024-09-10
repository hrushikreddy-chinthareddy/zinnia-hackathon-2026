import Page from './page';

class ManageAutoPayStartPage extends Page {

    get continueButton() {
        return cy.get(`[data-testid="Continue"]`);
    }

    get leaveTransaction() {
        return cy.get(`[data-testid="Cancel"]`);
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

}

export default new ManageAutoPayStartPage();