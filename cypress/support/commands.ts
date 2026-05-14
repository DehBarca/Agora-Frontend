// ***********************************************
// Comandos personalizados para Agora
// ***********************************************

declare namespace Cypress {
  interface Chainable {
    /**
     * Comando para hacer login
     * @example cy.login('test@ejemplo.com', 'password123')
     */
    login(email: string, password: string): Chainable<void>;
  }
}

// Comando para hacer login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.contains('button', 'Iniciar Sesión').click();
});
