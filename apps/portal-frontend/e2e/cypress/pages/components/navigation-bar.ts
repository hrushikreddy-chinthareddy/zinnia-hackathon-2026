import Page from '../page';

class NavigationBar extends Page {
  get ['User dropdown']() {
    return (
      cy.get('[class*="nav-bar"]').within(() => {
        cy.get('button[id*="radix"]');
      })
    );
  }

  get ['Sign out link']() {
    return (
      cy.get('[role="menu"][data-state="open"]').within(() => {
        cy.get('[role="menuitem"]');
      })
    );
  }

  getNavigationBarLink(navbarLink: string) {
    return cy.get(`[data-testid="${navbarLink}"]`);
  }
}

export default new NavigationBar();
