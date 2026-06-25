import 'cypress-axe'

// defino una variable para todos los elementos interactivos que pueden recibir foco 

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // creao la suit para los test de accesibilidad de la home
describe('Accessibility tests for the home page', () => {

// antes de cada test, visitar la home y cargar axe

  beforeEach(() => {
    cy.visit('https://automationintesting.online');
    cy.injectAxe();
  });

  it('Todos los elementos interactivos pueden recibir foco', () => {

    cy.get(focusableSelector)
      .filter(':visible')
      .should('have.length.greaterThan', 0)
      .each(($el) => {
        cy.wrap($el)
          .scrollIntoView()       
          .focus()
          .should('be.focused');  
      });
  });

  it('Los elementos muestran indicador visual de foco', () => {

    cy.get(focusableSelector)
      .filter(':visible')         
      .each(($el) => {
        cy.wrap($el).scrollIntoView().focus();

        cy.focused().then(($focused) => {
          const styles = window.getComputedStyle($focused[0]); 
          const hasVisibleFocus =
            (styles.outlineStyle !== 'none' && styles.outlineWidth !== '0px') ||
            styles.boxShadow !== 'none';

          expect(
            hasVisibleFocus,
            `Sin indicador de foco en <${$focused[0].tagName.toLowerCase()}>`
          ).to.be.true;
        });
      });
  });

// el formulario de contacto tiene  name , email ,phone , subject y message 

it('Todos los campos tienen un label asociado', () => {

  const fieldIds = [
    'name',
    'email',
    'phone',
    'subject',
    'description'
  ];

  fieldIds.forEach(id => {

    cy.get(`#${id}`)
      .should('exist');

    cy.get(`label[for="${id}"]`)
      .should('exist');

  });

});


});











