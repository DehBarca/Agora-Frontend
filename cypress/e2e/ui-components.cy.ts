describe('Validaciones de Formularios', () => {

  it('debería validar longitud mínima de contraseña', () => {
    cy.visit('/register');
    
    // Contraseña corta - inválida
    cy.get('input[formcontrolname="password"]').type('1234567');
    cy.get('input[formcontrolname="password"]').blur();
    cy.contains('Mínimo 8 caracteres').should('be.visible');
    
    // Contraseña válida - 8+ caracteres
    cy.get('input[formcontrolname="password"]').clear().type('12345678');
    cy.get('input[formcontrolname="password"]').blur();
    cy.contains('Mínimo 8 caracteres').should('not.exist');
  });

  it('debería validar email con formato correcto', () => {
    cy.visit('/register');
    
    // Email sin @
    cy.get('input[formcontrolname="email"]').type('emailinvalido');
    cy.get('input[formcontrolname="email"]').blur();
    cy.contains('Correo no válido').should('be.visible');
    
    // Email sin dominio
    cy.get('input[formcontrolname="email"]').clear().type('email@');
    cy.get('input[formcontrolname="email"]').blur();
    cy.contains('Correo no válido').should('be.visible');
  });

  it('debería requerir todos los campos para habilitar el botón', () => {
    cy.visit('/register');
    
    // Sin datos - botón deshabilitado
    cy.contains('button', 'Crear Cuenta').should('be.disabled');
    
    // Con todos los datos válidos - botón habilitado
    cy.get('input[formcontrolname="name"]').type('Juan');
    cy.get('input[formcontrolname="email"]').type('juan@ejemplo.com');
    cy.get('input[formcontrolname="password"]').type('password123');
    cy.contains('button', 'Crear Cuenta').should('not.be.disabled');
  });

});

