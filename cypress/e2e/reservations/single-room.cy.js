describe('Single Room Reservation', () => {

        beforeEach(() => {
            cy.visit('https://automationintesting.online/');
        });
            


        it('loads the single room reservation page and makes a reservation', () => {
            const hoy = new Date();
            const mañana = new Date();
            mañana.setDate(hoy.getDate() + 1);

            
            const formatearFecha = (fecha) => fecha.toISOString().split('T')[0];

            const fechaCheckin = formatearFecha(hoy);     
            const fechaCheckout = formatearFecha(mañana); 
        cy.get('[id="rooms"]').should('exist');
        cy.get('.row > :nth-child(1) > .card > .card-body > .card-title').should('contain', 'Single');
        cy.get(':nth-child(1) > .card > .card-footer > .btn').click();
        cy.url().should('include', `/reservation/1?checkin=${fechaCheckin}&checkout=${fechaCheckout}`);
        cy.get('.shadow > :nth-child(1)').should('exist');
        cy.get('#doReservation').should('contain', 'Reserve Now').click();
        cy.get('.shadow > :nth-child(1)').should('be.visible').and('contain', 'Book This Room');
        cy.fixture('single-room').then((data) => {
            const { registrouno } = data;
            cy.get('[name="firstname"]').type(registrouno.firstname);
            cy.get('[name="lastname"]').type(registrouno.lastname);
            cy.get('[name="email"]').type(registrouno.email);
            cy.get('[name="phone"]').type(registrouno.phone);
            cy.get('.btn-primary').should('contain', 'Reserve Now').click();
        });
        cy.get(':nth-child(1) > .col-lg-4 > .card > .card-body').should('be.visible').and('contain', 'Booking Confirmed');
        cy.get(':nth-child(1) > .col-lg-4 > .card > .card-body > .btn').should('be.visible').and('contain', 'Return home').click();
        });

});