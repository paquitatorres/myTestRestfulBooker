// Custom commands para la sección "Check Availability"

/*
 * Espera a que el widget de disponibilidad esté visible en pantalla.
 * Se usa al inicio de cada test para garantizar que la home cargó correctamente antes de interactuar con los campos.
 */
Cypress.Commands.add('waitForAvailabilityWidget', () => {
  cy.get('.container > .card > .card-body')
    .should('be.visible');
});

/**
 * Ingresa una fecha en el campo Check In.
 * @param {string} date - Fecha en formato dd/mm/yyyy
 */
Cypress.Commands.add('setCheckInDate', (date) => {
  cy.get(':nth-child(1) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
    .clear()
    .type(date);
});

/**
 * Ingresa una fecha en el campo Check Out.
 * @param {string} date - Fecha en formato dd/mm/yyyy
 */
Cypress.Commands.add('setCheckOutDate', (date) => {
  cy.get(':nth-child(2) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
    .clear()
    .type(date);
});

/**
 * Hace clic en el botón "Check Availability".
 */
Cypress.Commands.add('clickCheckAvailability', () => {
  cy.get('.col-8 > .btn').click();
});

/**
 * Flujo completo: ingresa ambas fechas y hace clic en el botón.
 * @param {string} checkIn  - Fecha de entrada (dd/mm/yyyy)
 * @param {string} checkOut - Fecha de salida  (dd/mm/yyyy)
 */
Cypress.Commands.add('searchAvailability', (checkIn, checkOut) => {
  cy.setCheckInDate(checkIn);
  cy.setCheckOutDate(checkOut);
  cy.clickCheckAvailability();
});

/**
 * Verifica que el resultado de disponibilidad sea visible.
 */
Cypress.Commands.add('assertRoomsVisible', () => {
  cy.get('#rooms')
    .should('exist')
    .and('be.visible');
});

// Verifica que efectivamente no se muestre disponibildad
Cypress.Commands.add('assertRoomsNotVisible', () => {
  cy.get('#rooms').should('not.exist');
});

/**
 * Verifica que el campo Check In tenga el valor esperado.
 * @param {string} expectedValue
 */
Cypress.Commands.add('assertCheckInValue', (expectedValue) => {
  cy.get(':nth-child(1) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
    .should('have.value', expectedValue);
});

/**
 * Verifica que el campo Check Out tenga el valor esperado.
 * @param {string} expectedValue
 */
Cypress.Commands.add('assertCheckOutValue', (expectedValue) => {
  cy.get(':nth-child(2) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
    .should('have.value', expectedValue);
});
