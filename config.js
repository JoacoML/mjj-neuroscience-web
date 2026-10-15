// Configuración del sitio. Es lo único que hay que tocar para conectar el formulario.
window.SITE_CONFIG = {
  // CTA "Ir a la plataforma"
  platformUrl: 'https://jjm-acv-web.vercel.app/',

  // Email que aparece en el footer y como plan B si el formulario no está configurado.
  contactEmail: 'contacto@mjjneuroscience.com',

  // URL de la Web App de Google Apps Script (termina en /exec). Ver README → "Formulario de demo".
  // Vacío = el botón abre el cliente de mail del visitante con los datos cargados.
  googleSheetsEndpoint: '',
};
