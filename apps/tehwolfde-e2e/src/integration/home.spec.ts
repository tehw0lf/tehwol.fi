describe('tehwolfi', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    cy.contains('Welcome to tehwolf.de!');
  });
});
