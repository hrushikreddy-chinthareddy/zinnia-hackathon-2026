import Page from '../page';

class NavigationBar extends Page {
    get userDropdown() {
        return cy.get('[class*="nav-bar"]').within(() => {
            cy.get('button[id*="radix"]');
        });
    }

    get SignOutLink() {
        return cy.get('[role="menu"][data-state="open"]').within(() => {
            cy.get('[role="menuitem"]');
        });
    }

    // -------------------------------------------------------------------------------------------------------------------

    getUserDropdownLink() {
        this.userDropdown.click();
    }

    getSignOutLink() {
        this.SignOutLink.click();
    }

    getNavigationBarLink(navbarLink: string) {
        return cy.get(`[data-testid="${navbarLink}"]`);
    }
}

export default new NavigationBar();
