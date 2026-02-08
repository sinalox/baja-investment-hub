import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  phone: z.string().trim().min(1, 'El teléfono es requerido').max(20, 'El teléfono es muy largo'),
  email: z.string().trim().email('Email inválido').max(255, 'El email es muy largo').or(z.literal('')),
  property_type: z.string().min(1, 'Selecciona un tipo de propiedad'),
  message: z.string().trim().max(1000, 'El mensaje es muy largo').optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    property_type: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('leads').insert({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email || null,
        property_type: result.data.property_type,
        notes: result.data.message || null,
        status: 'nuevo',
        source: 'formulario_web',
      });

      if (error) throw error;

      toast({
        title: '¡Mensaje enviado!',
        description: 'Nos pondremos en contacto contigo pronto.',
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        property_type: '',
        message: '',
      });
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="name"
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
                  className="w-full px-4 py-3 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                />
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
