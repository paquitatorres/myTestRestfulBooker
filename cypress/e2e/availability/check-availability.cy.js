
describe('Check Availability & Book Your Stay', () => {
  // Cargamos el fixture una sola vez para todos los tests
  let dates;

  before(() => {
    cy.fixture('availability-dates').then((data) => {
      dates = data;
    });
  });

  // Antes de cada test volvemos a la home para garantizar independencia
  beforeEach(() => {
    cy.visit('https://automationintesting.online/');
    cy.waitForAvailabilityWidget();
  });

  // ============================================================
  // BLOQUE 1 — Renderizado inicial
  // ============================================================
  describe('Renderizado del widget de disponibilidad', () => {
    it('El widget de disponibilidad debe estar visible en la home', () => {
      cy.get('.container > .card > .card-body')
        .should('exist')
        .and('be.visible');
    });

    it('El campo Check In debe estar presente y habilitado', () => {
      cy.get(':nth-child(1) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled');
    });

    it('El campo Check Out debe estar presente y habilitado', () => {
      cy.get(':nth-child(2) > .react-datepicker-wrapper > .react-datepicker__input-container > .form-control')
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled');
    });
    // Solo verifica la visiblidad del boton.
    it('El botón "Check Availability" debe estar visible', () => {
      cy.get('.col-8 > .btn')
        .should('exist')
        .and('be.visible');
    });
  });

  // ============================================================
  // BLOQUE 2 — Casos POSITIVOS
  // ============================================================
  describe('Casos Positivos', () => {
    it('Fechas válidas muestran habitaciones disponibles', () => {
      cy.searchAvailability(dates.validDates.checkIn, dates.validDates.checkOut);
      cy.assertRoomsVisible();
    });

    it('Estadía de 1 noche', () => {
      cy.searchAvailability(dates.oneDayStay.checkIn, dates.oneDayStay.checkOut);
      cy.assertRoomsVisible();
    });

    it('Los campos deben aceptar y mostrar las fechas ingresadas', () => {
      cy.setCheckInDate(dates.validDates.checkIn);
      cy.setCheckOutDate(dates.validDates.checkOut);

      cy.assertCheckInValue(dates.validDates.checkIn);
      cy.assertCheckOutValue(dates.validDates.checkOut);
    });
    //Aqui no valida solamente la renderizacion, sino la funcionalidad del boton.
    //En conjunto con el  it('El botón "Check Availability" debe estar visible') testea completamente al boton.
    it('Boton funcional', () => {
      cy.setCheckInDate(dates.validDates.checkIn);
      cy.setCheckOutDate(dates.validDates.checkOut);

      cy.get('.col-8 > .btn')
        .should('not.be.disabled')
        .click();
    });

    it('Búsqueda con fechas lejanas', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');
      cy.searchAvailability(dates.farFutureDates.checkIn, dates.farFutureDates.checkOut);
      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
    });
  });

  // ============================================================
  // BLOQUE 3 — Casos NEGATIVOS
  // ============================================================
  describe('Casos Negativos', () => {
    it('Check Out anterior al Check In', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');
      cy.searchAvailability(
        dates.checkOutBeforeCheckIn.checkIn,
        dates.checkOutBeforeCheckIn.checkOut
      );
      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
    });

    it('Fechas del pasado', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');

      cy.searchAvailability(dates.pastDates.checkIn, dates.pastDates.checkOut);

      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
    });

    it('Solo Check In sin Check Out ', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');

      cy.setCheckInDate(dates.validDates.checkIn);
      cy.clickCheckAvailability();

      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
      cy.assertRoomsVisible();
    });


    it('Solo Check Out sin Check In', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');

      cy.setCheckOutDate(dates.validDates.checkOut);
      cy.clickCheckAvailability();

      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
      cy.assertRoomsVisible();
    });
  });

  // ============================================================
  // BLOQUE 4 — Casos de BORDE
  // ============================================================
  describe(' Casos de Borde', () => {
    it('Check In y Check Out en el mismo día (estadía 0 noches)', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');

      cy.searchAvailability(dates.sameDayDates.checkIn, dates.sameDayDates.checkOut);

      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
    });

    it('Estadía larga', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');

      cy.searchAvailability(dates.longStay.checkIn, dates.longStay.checkOut);

      cy.wait('@roomRequest').its('response.statusCode').should('eq', 200);
    });

    it('Cambiar fechas luego de una búsqueda exitosa dispara una nueva consulta', () => {
      cy.intercept('GET', '**/api/room**').as('roomRequest');

      // Primera búsqueda
      cy.searchAvailability(dates.validDates.checkIn, dates.validDates.checkOut);
      cy.wait('@roomRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.request.url).to.include('checkin=2026-06-19');
        expect(interception.request.url).to.include('checkout=2026-06-26');
      });

      // Segunda búsqueda con fechas distintas, dispara una nueva busqueda
      cy.searchAvailability(dates.longStay.checkIn, dates.longStay.checkOut);
      cy.wait('@roomRequest').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.request.url).to.include('checkin=2026-06-19');
        expect(interception.request.url).to.include('checkout=2026-08-19');
      });
    });
  });
});
