import Page from '../page';

class CreateCasePage extends Page {
    url = '/create-case';

    get documentIdTextBox() {
        return cy.get('[aria-label="Document ID"]');
    }

    get caseTypeComboBox() {
        return cy.get('[data-testid="case-type-select"]');
    }

    get clientComboBox() {
        return cy.get('button[role="combobox"]').last();
    }

    get searchButton() {
        return cy.get(`[type="button"]`).contains('Search');
    }

    setDocumentIdDate(id) {
        this.documentIdTextBox.focus().type(id, { force: true });
    }

    setCaseTypeComboBox(value) {
        this.caseTypeComboBox.focus().type(`${value}{enter}{enter}`, { force: true });
    }

    setClientComboBox(value) {
        this.clientComboBox.focus().type(`${value}{enter}{enter}`, { force: true });
    }

    fireSearch() {
        this.searchButton.click();
    }
}

export default new CreateCasePage();
