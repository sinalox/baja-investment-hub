import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    quote: 'Gracias a Heredia Land Baja encontramos el terreno perfecto para construir nuestra casa de retiro. El proceso fue transparente y profesional desde el primer día.',
    author: 'Roberto Sánchez',
    role: 'Inversionista desde 2019',
    rating: 5,
  },
  {
    quote: 'La asesoría personalizada hizo toda la diferencia. Me ayudaron a entender el potencial de plusvalía y hoy mi inversión ha crecido un 35%.',
    author: 'María Elena Cortés',
    role: 'Inversionista desde 2020',
    rating: 5,
  },
  {
    quote: 'Excelente servicio y propiedades de primera calidad. Recomiendo totalmente a quienes busquen invertir en Baja California.',
    author: 'Carlos Mendoza',
    role: 'Inversionista desde 2018',
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="section-padding bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <span className="text-accent text-xs md:text-sm font-semibold tracking-widest uppercase mb-2 md:mb-4 block">
            Testimonios
          </span>
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle mx-auto">
            La confianza de nuestros clientes es nuestro mayor respaldo
          </p>
        </div>

        {/* Testimonials: carrusel deslizable en móvil, grid en escritorio */}
        <div className="scroll-row gap-4 -mx-6 px-6 pb-2 md:grid md:grid-cols-3 md:gap-8 md:mx-0 md:px-0 md:pb-0 md:overflow-visible">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="shrink-0 w-[85%] sm:w-[60%] md:w-auto snap-center bg-background rounded-lg p-6 md:p-8 shadow-card hover:shadow-lg transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 md:h-10 md:w-10 text-accent/30 mb-4 md:mb-6" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[0.95rem] md:text-base text-foreground/80 leading-relaxed mb-5 md:mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="pt-4 md:pt-6 border-t border-border">
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground md:hidden">Desliza para ver más →</p>
      </div>
    </section>
  );
};

export default Testimonials;
