import Page from '../../page';

class PremiumsPage extends Page {
    url = '/policy/premiums';

    // --- Selectors --- //
    get ['Manage autopay link']() {
        return cy.get('a[data-testid="Manage autopay"]');
    }

    get ['One Time Payment link']() {
        return cy.get('a[data-testid="Make one-time payment"]');
    }

    // --- Actions--- //
}

export default new PremiumsPage();
