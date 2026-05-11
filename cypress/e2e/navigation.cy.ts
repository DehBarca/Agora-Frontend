describe('Navegación', () => {

  it('debería redireccionar de la raíz al login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('debería navegar entre login y registro', () => {
    cy.visit('/login');
    
    // Ir a registro
    cy.contains('a', 'Regístrate aquí').click();
    cy.url().should('include', '/register');
    
    // Volver a login
    cy.contains('a', 'Inicia sesión').click();
    cy.url().should('include', '/login');
  });

  it('debería usar el botón de regresar en registro', () => {
    cy.visit('/register');
    cy.get('.back-button').click();
    cy.url().should('include', '/login');
  });

});
