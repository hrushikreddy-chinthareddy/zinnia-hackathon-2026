import Page from './page';

class LoginPage extends Page {
  url = '/u/login';

  get ['Email address input']() {
    return cy.get('#username');
  }

  get ['Password input']() {
    return cy.get('input[type="password"]');
  }

  get ['Email continue button']() {
    return cy.get('button[class*="login-id"]');
  }

  get ['Password continue button']() {
    return cy.get('button[class*="login-password"]');
    
  }

  get ['Login error message']() {
    return cy.get('[data-error-code="wrong-email-credentials"]');
  }

  get ['Continue button']() {
    return cy.get('button[type="submit"]');
  }

  login(email: string, password: string): void {
    this['Email address input'].type(email);
    this['Email continue button'].click();

    this['Password input'].type(password);
    this['Password continue button'].click();
  }
}

export default new LoginPage();
