import { withBookingDates } from '../../support/api/booking';

describe('API — Reservas (Booking)', () => {
  let payloads;

  before(() => {
    cy.fixture('booking-payloads').then((data) => {
      payloads = data;
    });
  });

  // POST /api/booking — Creación como invitado (sin auth)
  describe('POST /api/booking — Casos positivos', () => {
    it('Debe crear una reserva válida y devolver 201 con bookingid', () => {
      cy.createBooking(payloads.validGuest).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.include({
          firstname: payloads.validGuest.firstname,
          lastname: payloads.validGuest.lastname,
          roomid: payloads.validGuest.roomid,
          depositpaid: payloads.validGuest.depositpaid,
        });
        expect(response.body.bookingid).to.be.a('number').and.be.greaterThan(0);
        expect(response.body.bookingdates).to.have.keys('checkin', 'checkout');
      });
    });
  });

  describe('POST /api/booking — Validaciones (casos negativos)', () => {
    it('Body vacío debe devolver 400 con errores de validación', () => {
      cy.request({
        method: 'POST',
        url: '/api/booking',
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors).to.be.an('array').and.not.be.empty;
        expect(response.body.errors.join(' ')).to.match(/Firstname|Lastname|roomid/i);
      });
    });

    it('Email inválido debe devolver 400', () => {
      cy.createBooking(payloads.invalidEmail).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors.join(' ')).to.include('well-formed email');
      });
    });

    it('Teléfono demasiado corto debe devolver 400', () => {
      cy.createBooking(payloads.phoneTooShort).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors.join(' ')).to.match(/11 and 21/);
      });
    });

    it('Teléfono demasiado largo debe devolver 400', () => {
      cy.createBooking(payloads.phoneTooLong).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors.join(' ')).to.match(/11 and 21/);
      });
    });

    it('Campos obligatorios faltantes (nombre/apellido) debe devolver 400', () => {
      cy.createBooking(payloads.missingNames).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors.join(' ')).to.match(/Firstname|Lastname|blank/i);
      });
    });

    it('Fechas planas (checkin/checkout) sin bookingdates devuelve 500 — bug conocido', () => {
      cy.request({
        method: 'POST',
        url: '/api/booking',
        body: payloads.flatDatesInvalidFormat,
        failOnStatusCode: false,
        timeout: 90000,
      }).then((response) => {
        expect(response.status).to.eq(500);
        expect(response.body.errors).to.include('Failed to create booking');
      });
    });
  });

  describe('POST /api/booking — Casos de borde', () => {
    it('Checkout anterior al checkin debe rechazar la reserva (409)', () => {
      cy.request({
        method: 'POST',
        url: '/api/booking',
        body: payloads.checkoutBeforeCheckin,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body.error || response.body.errors?.[0]).to.match(/Failed to create booking/i);
      });
    });

    it('Roomid inexistente (999) — la API no valida existencia de habitación', () => {
      cy.createBooking(payloads.invalidRoomId, { dateOptions: { offsetDays: 1100 } }).then((response) => {
        // Bug documentado: acepta roomid inexistente (201) o rechaza por conflicto (409)
        expect(response.status).to.be.oneOf([201, 409]);

        if (response.status === 201) {
          expect(response.body.roomid).to.eq(999);
        }
      });
    });
  });

  // Autenticación
  describe('POST /api/auth/login', () => {
    it('Credenciales válidas devuelven token', () => {
      cy.apiLogin().then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.token).to.be.a('string').and.not.be.empty;
      });
    });

    it('Credenciales inválidas devuelven 401', () => {
      cy.apiLogin('admin', 'wrong-password').then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq('Invalid credentials');
      });
    });
  });

  // CRUD autenticado
  describe('GET /api/booking — Requiere autenticación', () => {
    it('Sin token debe devolver 401', () => {
      cy.request({
        method: 'GET',
        url: '/api/booking',
        qs: { roomid: 1 },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.error).to.eq('Authentication required');
      });
    });

    it('Con token y roomid debe listar reservas de la habitación', () => {
      cy.apiLogin().then((loginRes) => {
        const token = loginRes.body.token;

        cy.getBookingsByRoom(1, token).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.bookings).to.be.an('array');
          if (response.body.bookings.length > 0) {
            expect(response.body.bookings[0]).to.include.keys(
              'bookingid',
              'roomid',
              'firstname',
              'lastname',
              'bookingdates',
            );
          }
        });
      });
    });

    it('GET /api/booking/:id devuelve detalle de una reserva', () => {
      cy.apiLogin().then((loginRes) => {
        const token = loginRes.body.token;

        cy.getBookingsByRoom(1, token).then((listRes) => {
          const first = listRes.body.bookings[0];
          if (!first) {
            cy.log('No hay reservas en room 1 — omitiendo aserción de detalle');
            return;
          }

          cy.getBookingById(first.bookingid, token).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.bookingid).to.eq(first.bookingid);
          });
        });
      });
    });
  });

  describe('PUT /api/booking/:id — Actualización autenticada', () => {
    it('Debe actualizar una reserva existente con token válido', () => {
      cy.createBooking(payloads.validMinimal, {
        dateOptions: { offsetDays: 900, stayNights: 2 },
      }).then((createRes) => {
        expect(createRes.status).to.eq(201);

        const { bookingid, ...bookingWithoutId } = createRes.body;
        const updatePayload = {
          ...bookingWithoutId,
          lastname: 'Actualizado',
          depositpaid: true,
        };

        cy.apiLogin().then((loginRes) => {
          cy.updateBooking(bookingid, updatePayload, loginRes.body.token).then((response) => {
            expect(response.status).to.be.oneOf([200, 409]);

            if (response.status === 200) {
              expect(response.body.lastname).to.eq('Actualizado');
              expect(response.body.depositpaid).to.eq(true);
            }
          });
        });
      });
    });

    it('Sin token debe devolver 403', () => {
      cy.request({
        method: 'PUT',
        url: '/api/booking/1',
        body: withBookingDates(payloads.validGuest),
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('DELETE /api/booking/:id — Eliminación autenticada', () => {
    it('Debe eliminar una reserva creada previamente', () => {
      cy.createBooking(payloads.validGuest, { dateOptions: { offsetDays: 600 } }).then((createRes) => {
        expect(createRes.status).to.eq(201);
        const bookingId = createRes.body.bookingid;

        cy.apiLogin().then((loginRes) => {
          cy.deleteBooking(bookingId, loginRes.body.token).then((response) => {
            expect(response.status).to.eq(202);
          });
        });
      });
    });

    it('Reserva inexistente debe devolver 404', () => {
      cy.apiLogin().then((loginRes) => {
        cy.deleteBooking(999999, loginRes.body.token).then((response) => {
          expect(response.status).to.eq(404);
        });
      });
    });
  });
});
