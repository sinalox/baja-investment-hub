import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { siteConfig, whatsappUrl, phoneUrl, emailUrl, mapsUrl } from '@/config/site';
import {
  HONEYPOT_FIELD,
  getFieldErrors,
  insertPublicLead,
  isBotSubmission,
  publicLeadSchema,
  type PublicLeadErrors,
} from '@/lib/leads';

interface ContactFormState {
  name: string;
  phone: string;
  email: string;
  property_type: string;
  message: string;
}

const emptyForm: ContactFormState = {
  name: '',
  phone: '',
  email: '',
  property_type: '',
  message: '',
};

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormState>(emptyForm);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<PublicLeadErrors>({});
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof PublicLeadErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const showSuccess = () => {
    toast({
      title: '¡Mensaje enviado!',
      description: 'Nos pondremos en contacto contigo pronto.',
    });
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = publicLeadSchema.safeParse(formData);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    // Bot: simulamos éxito sin guardar nada
    if (isBotSubmission(honeypot)) {
      showSuccess();
      return;
    }

    setIsSubmitting(true);

    try {
      await insertPublicLead(result.data, 'formulario_web');
      showSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al enviar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="section-padding bg-background">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Left - Info */}
          <div>
            <span className="text-accent text-xs md:text-sm font-semibold tracking-widest uppercase mb-2 md:mb-4 block">
              Contáctanos
            </span>
            <h2 className="section-title mb-6">
              ¿Listo para invertir en tu futuro?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-10">
              Déjanos tus datos y uno de nuestros asesores se pondrá en contacto contigo 
              para brindarte información personalizada sobre nuestras propiedades.
            </p>

            {/* Contact Info: todo tocable en móvil (llamar, correo, mapa) */}
            <div className="space-y-2 md:space-y-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors group"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-accent flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-accent">
                    WhatsApp
                  </div>
                  <div className="text-sm text-muted-foreground">{siteConfig.phoneDisplay}</div>
                </div>
              </a>

              <a
                href={phoneUrl}
                className="flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                  <Phone className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">Teléfono</div>
                  <div className="text-sm text-muted-foreground break-words">{siteConfig.phoneDisplay}</div>
                </div>
              </a>

              <a
                href={emailUrl}
                className="flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                  <Mail className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">Email</div>
                  <div className="text-sm text-muted-foreground break-words">{siteConfig.email}</div>
                </div>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">Oficina</div>
                  <div className="text-sm text-muted-foreground">
                    {siteConfig.address.line1}
                    <br />
                    {siteConfig.address.line2}
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right - Form */}
          <div id="formulario" className="bg-secondary/50 rounded-xl p-5 sm:p-8 lg:p-10 scroll-mt-24">
            <h3 className="font-sans text-xl md:text-2xl font-medium mb-5 md:mb-6">
              Quiero recibir información
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot antispam: oculto para personas */}
              <input
                type="text"
                name={HONEYPOT_FIELD}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={`w-full h-12 px-4 bg-background border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                    errors.name ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+52 (___) ___ ____"
                    className={`w-full h-12 px-4 bg-background border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                      errors.phone ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={`w-full h-12 px-4 bg-background border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${
                      errors.email ? 'border-destructive' : 'border-border'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de propiedad de interés *
                </label>
                <select 
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  className={`w-full h-12 px-4 bg-background border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all appearance-none cursor-pointer ${
                    errors.property_type ? 'border-destructive' : 'border-border'
                  }`}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="casa">Casa</option>
                  <option value="oficina">Oficina</option>
                  <option value="lote">Lote Residencial</option>
                  <option value="inversion">Terreno de Inversión</option>
                </select>
                {errors.property_type && (
                  <p className="text-sm text-destructive mt-1">{errors.property_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Cuéntanos qué estás buscando..."
                  className={`w-full px-4 py-3 bg-background border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none ${
                    errors.message ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.message && (
                  <p className="text-sm text-destructive mt-1">{errors.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                variant="gold" 
                size="xl" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Quiero recibir información
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Al enviar este formulario, aceptas nuestra{' '}
                <Link to="/privacidad" className="text-accent hover:underline">
                  aviso de privacidad
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
