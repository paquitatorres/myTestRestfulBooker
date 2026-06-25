// Import commands de la seccion availability  :
import './actions/availability'
//Excepciones para evitar errores de react
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('Minified React error #418') ||
    err.message.includes('Minified React error #421') ||
    err.message.includes('Minified React error #423') ||
    err.message.includes('Hydration failed')
  ) {
    return false;
  }
  return true;
});

Cypress.Commands.add('llenarFormularioDesdeFixture', (escenario) => {
  
  cy.fixture('datosReserva').then((datos) => {
    
    const usuario = datos[escenario]; 

    cy.get('[name="firstname"]').clear();
    if (usuario.firstname.trim() !== '') {
      cy.get('[name="firstname"]').type(usuario.firstname);
    }

    cy.get('[name="lastname"]').clear();
    if (usuario.lastname.trim() !== '') {
      cy.get('[name="lastname"]').type(usuario.lastname);
    }

    cy.get('[name="email"]').clear();
    if (usuario.email.trim() !== '') {
      cy.get('[name="email"]').type(usuario.email);
    }

    cy.get('[name="phone"]').clear();
    if (usuario.phone.trim() !== '') {
      cy.get('[name="phone"]').type(usuario.phone);
    }
  });
});
