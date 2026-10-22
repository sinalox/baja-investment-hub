// Datos de contacto y redes del sitio. Cambiar aquí actualiza Header, Footer,
// formulario de contacto y página de propiedad.
// TODO: confirmar teléfono, WhatsApp y dirección reales.
export const siteConfig = {
  name: 'Heredia Land Baja',
  email: 'info@heredialandbaja.com',
  // Formato E.164 sin "+" (lo usan los enlaces tel: y wa.me)
  phone: '526461234567',
  phoneDisplay: '+52 646 123 4567',
  whatsapp: '526461234567',
  address: {
    line1: 'Blvd. Costero 1500, Zona Centro',
    line2: 'Ensenada, Baja California, México',
  },
  // Dejar vacío para ocultar la red social en el footer
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
};

export const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}`;
export const phoneUrl = `tel:+${siteConfig.phone}`;
export const emailUrl = `mailto:${siteConfig.email}`;
