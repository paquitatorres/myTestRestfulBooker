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