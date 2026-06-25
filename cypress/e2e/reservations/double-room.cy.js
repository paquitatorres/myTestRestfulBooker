describe.only('Caso 1: Reserva de Room Double', () => {
  
  // Le decimos a Cypress que ignore los errores internos de la página web
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Debe hacer una reserva exitosa como invitado', () => {
    
    cy.visit('https://automationintesting.online/');
    
    cy.get(':nth-child(2) > .card > .card-footer > .btn').click();
    cy.get('#doReservation').click();
    //cy.llenarFormularioDesdeFixture(valido)
    cy.get('[name="firstname"]').type('marian');
    cy.get('[name="lastname"]').type('monez');
    cy.get('[name="email"]').type('moneza@email.com');
    cy.get('[name="phone"]').type('12345678913');
    cy.get('.btn-primary').click();
    cy.contains('Booking Confirmed').should('be.visible');
  });

});
describe('Caso 2: Reserva de Room Double en blanco', () => {
  
  // Le decimos a Cypress que ignore los errores internos de la página web
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('Debe hacer una reserva fallida como invitado', () => {
    
    cy.visit('https://automationintesting.online/');
    
    cy.get(':nth-child(2) > .card > .card-footer > .btn').click();
    cy.get('#doReservation').click();
    cy.get('.btn-primary').click();
    cy.get('.alert').should('be.visible')
    cy.get('.alert').should('contain','must not be empty',)
    cy.get('.alert').should('contain','should not be blank',)
  });

});

describe('Caso 3: Reserva de Room Double alertas', () => {
  
  // Le decimos a Cypress que ignore los errores internos de la página web
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('prueba de alertas', () => {
    
    cy.visit('https://automationintesting.online/');

    cy.get(':nth-child(2) > .card > .card-footer > .btn').click();
    cy.get('#doReservation').click();
    cy.get('[name="firstname"]').type('leo@123');
    cy.get('[name="lastname"]').type('mate|123');
    cy.get('[name="email"]').type('moneza.email.com');
    cy.get('[name="phone"]').type('amsd1234.-ocuas');
    cy.get('.btn-primary').click();
    cy.get('.alert').should('have.length', 1);
    cy.contains('must be a well-formed email address').should('be.visible');
    cy.contains('Booking Confirmed').should('not.exist');
  });

});

describe('Caso 5: Reserva de Room Double alertas', () => {
  
  // Le decimos a Cypress que ignore los errores internos de la página web
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it('prueba de alertas', () => {

    cy.visit('https://automationintesting.online/');

    cy.get(':nth-child(2) > .card > .card-footer > .btn').click();
    //como me fue imposible arrastrar para hacer una reserva manipule la url, igual se probo manualmente y da el mismo resultado sin manipular la url
    cy.visit('https://automationintesting.online/reservation/2?checkin=2025-06-25&checkout=2026-06-26')
    cy.get('#doReservation').click();
    cy.get('[name="firstname"]').type('leo@123');
    cy.get('[name="lastname"]').type('mate|123');
    cy.get('[name="email"]').type('moneza@email.com');
    cy.get('[name="phone"]').type('amsd123ddl.com');
    cy.get('.btn-primary').click();
    cy.contains('Booking Confirmed').should('be.visible');
  });

});

describe('Caso 6: Acceso directo por URL sin parámetros', () => {
  
  Cypress.on('uncaught:exception', () => false);

  it('Debe cargar el calendario y no dejar al usuario bloqueado', () => {
    
    cy.visit('https://automationintesting.online/reservation/2');
    cy.get('body').should('not.be.empty');
    cy.get('.rbc-calendar').should('be.visible'); 
  });

});

