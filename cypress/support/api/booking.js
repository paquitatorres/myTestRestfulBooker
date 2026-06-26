/**
 * Helpers y custom commands para la API de reservas.
 * Usa baseUrl de cypress.config.js para rutas relativas (/api/...).
 */

/**
 * Genera fechas futuras únicas para evitar conflictos de disponibilidad.
 * @param {number} offsetDays - Días desde hoy para el check-in base
 * @param {number} stayNights - Noches de estadía
 */
export function buildFutureDates(offsetDays = 400, stayNights = 4) {
  const jitter = Math.floor(Math.random() * 60);
  const checkinDate = new Date();
  checkinDate.setDate(checkinDate.getDate() + offsetDays + jitter);

  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + stayNights);

  const toIso = (date) => date.toISOString().slice(0, 10);

  return {
    checkin: toIso(checkinDate),
    checkout: toIso(checkoutDate),
  };
}

/**
 * Combina un payload parcial con bookingdates generadas dinámicamente.
 */
export function withBookingDates(payload, dateOptions = {}) {
  return {
    ...payload,
    bookingdates: buildFutureDates(
      dateOptions.offsetDays,
      dateOptions.stayNights,
    ),
  };
}

Cypress.Commands.add('apiLogin', (username = 'admin', password = 'password') => {
  return cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { username, password },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('createBooking', (payload, options = {}) => {
  const body = payload.bookingdates
    ? payload
    : withBookingDates(payload, options.dateOptions);

  return cy.request({
    method: 'POST',
    url: '/api/booking',
    body,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('getBookingsByRoom', (roomId, token) => {
  return cy.request({
    method: 'GET',
    url: '/api/booking',
    qs: { roomid: roomId },
    headers: { Cookie: `token=${token}` },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('getBookingById', (bookingId, token) => {
  return cy.request({
    method: 'GET',
    url: `/api/booking/${bookingId}`,
    headers: { Cookie: `token=${token}` },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('updateBooking', (bookingId, payload, token) => {
  return cy.request({
    method: 'PUT',
    url: `/api/booking/${bookingId}`,
    body: payload,
    headers: { Cookie: `token=${token}` },
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('deleteBooking', (bookingId, token) => {
  return cy.request({
    method: 'DELETE',
    url: `/api/booking/${bookingId}`,
    headers: { Cookie: `token=${token}` },
    failOnStatusCode: false,
  });
});
