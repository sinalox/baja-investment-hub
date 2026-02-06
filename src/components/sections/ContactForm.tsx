import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, MapPin, Send } from 'lucide-react';

const ContactForm = () => {
  return (
    <section id="contacto" className="section-padding bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Info */}
          <div>
            <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 block">
              Contáctanos
            </span>
            <h2 className="section-title mb-6">
              ¿Listo para invertir en tu futuro?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Déjanos tus datos y uno de nuestros asesores se pondrá en contacto contigo 
              para brindarte información personalizada sobre nuestras propiedades.
            </p>

            {/* Contact Info */}
            <div className="space-y-6">
              <a
                href="https://wa.me/526461234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-accent">
                    WhatsApp
                  </div>
                  <div className="text-sm text-muted-foreground">+52 646 123 4567</div>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Phone className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Teléfono</div>
                  <div className="text-sm text-muted-foreground">+52 646 123 4567</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Email</div>
                  <div className="text-sm text-muted-foreground">info@heredialandbaja.com</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Oficina</div>
                  <div className="text-sm text-muted-foreground">
                    Blvd. Costero 1500, Zona Centro
                    <br />
                    Ensenada, Baja California, México
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-secondary/50 rounded-xl p-8 lg:p-10">
            <h3 className="font-serif text-2xl font-medium mb-6">
              Quiero recibir información
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="w-full h-12 px-4 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+52 (___) ___ ____"
                    className="w-full h-12 px-4 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="w-full h-12 px-4 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de propiedad de interés
                </label>
                <select className="w-full h-12 px-4 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all appearance-none cursor-pointer">
                  <option value="">Selecciona una opción</option>
                  <option value="casa">Casa</option>
                  <option value="oficina">Oficina</option>
                  <option value="lote">Lote Residencial</option>
                  <option value="inversion">Terreno de Inversión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos qué estás buscando..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                />
              </div>

              <Button variant="gold" size="xl" className="w-full">
                <Send className="h-5 w-5" />
                Quiero recibir información
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Al enviar este formulario, aceptas nuestra{' '}
                <a href="#" className="text-accent hover:underline">
                  política de privacidad
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
