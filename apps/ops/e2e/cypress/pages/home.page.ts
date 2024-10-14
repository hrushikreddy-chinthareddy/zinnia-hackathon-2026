import Page from './page';

class HomePage extends Page {
  url = '/';

  get ['Continue to sign in']() {
    return cy.get('button').contains('Continue to sign in');
  }
}

export default new HomePage();
