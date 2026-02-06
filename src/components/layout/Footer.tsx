import { Facebook, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Propiedades', href: '#propiedades' },
    { label: 'Desarrollos', href: '#desarrollos' },
    { label: 'Sobre Nosotros', href: '#nosotros' },
    { label: 'Contacto', href: '#contacto' },
  ];

  const propertyTypes = [
    { label: 'Casas', href: '#casas' },
    { label: 'Oficinas', href: '#oficinas' },
    { label: 'Lotes Residenciales', href: '#lotes' },
    { label: 'Terrenos de Inversión', href: '#inversion' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="font-serif text-2xl font-semibold tracking-tight mb-4">
              <span className="block leading-tight">HEREDIA</span>
              <span className="block text-sm font-sans font-normal tracking-[0.25em] opacity-70">
                LAND BAJA
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Tu socio de confianza para inversiones inmobiliarias en Baja California. 
              Más de 15 años construyendo patrimonios.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-5">Navegación</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold mb-5">Propiedades</h4>
            <ul className="space-y-3">
              {propertyTypes.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Blvd. Costero 1500, Zona Centro
                  <br />
                  Ensenada, Baja California, México
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <a
                  href="tel:+526461234567"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  +52 646 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <a
                  href="mailto:info@heredialandbaja.com"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  info@heredialandbaja.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {currentYear} Heredia Land Baja. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
            >
              Aviso de privacidad
            </a>
            <a
              href="#"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm"
            >
              Términos y condiciones
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
