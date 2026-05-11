describe('Autenticación', () => {

  it('debería mostrar error con credenciales incorrectas', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('noexiste@ejemplo.com');
    cy.get('input[name="password"]').type('passwordincorrecta');
    cy.contains('button', 'Iniciar Sesión').click();
    
    // Debe permanecer en login al fallar
    cy.url().should('include', '/login');
  });

  it('debería validar campos requeridos en registro', () => {
    cy.visit('/register');
    
    // Botón deshabilitado sin datos
    cy.contains('button', 'Crear Cuenta').should('be.disabled');
    
    // Llenar todos los campos
    cy.get('input[formcontrolname="name"]').type('Juan Pérez');
    cy.get('input[formcontrolname="email"]').type('juan@ejemplo.com');
    cy.get('input[formcontrolname="password"]').type('password123');
    
    // Botón habilitado con datos válidos
    cy.contains('button', 'Crear Cuenta').should('not.be.disabled');
  });

  it('debería validar formato de email', () => {
    cy.visit('/register');
    
    // Email inválido
    cy.get('input[formcontrolname="email"]').type('emailinvalido');
    cy.get('input[formcontrolname="email"]').blur();
    cy.contains('Correo no válido').should('be.visible');
    
    // Email válido
    cy.get('input[formcontrolname="email"]').clear().type('correo@valido.com');
    cy.get('input[formcontrolname="email"]').blur();
    cy.contains('Correo no válido').should('not.exist');
  });

});

