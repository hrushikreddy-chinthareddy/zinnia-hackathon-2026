export default abstract class Page {
  url = undefined;

  open(url?: string) {
    cy.visit(url ?? this.url);
  }
}
