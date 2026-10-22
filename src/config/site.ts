// Datos de contacto y redes del sitio. Cambiar aquí actualiza Header, Footer,
// formulario de contacto y página de propiedad.
export const siteConfig = {
  name: 'Heredia Land Baja',
  email: 'iheredia@landbaja.com',
  // Formato E.164 sin "+" (lo usan los enlaces tel: y wa.me)
  phone: '526646512061',
  phoneDisplay: '+52 664 651 2061',
  whatsapp: '526646512061',
  address: {
    line1: 'Av. Padre Kino 1005',
    line2: 'Tijuana, Baja California, México',
  },
  // Dejar vacío para ocultar la red social en el footer
  social: {
    facebook: 'https://www.facebook.com/HerediaLandbaja',
    instagram: 'https://www.instagram.com/landbaja.mx',
    linkedin: '',
    youtube: '',
  },
};

export const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}`;
export const phoneUrl = `tel:+${siteConfig.phone}`;
export const emailUrl = `mailto:${siteConfig.email}`;
