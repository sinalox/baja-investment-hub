import { Search, Calendar, MessageCircle, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Explora propiedades',
    description: 'Navega por nuestro catálogo y descubre las mejores opciones de inversión.',
  },
  {
    icon: Calendar,
    number: '02',
    title: 'Agenda una visita',
    description: 'Programa una visita presencial o virtual para conocer la propiedad.',
  },
  {
    icon: MessageCircle,
    number: '03',
    title: 'Recibe asesoría',
    description: 'Nuestros expertos te guiarán con información detallada y opciones de financiamiento.',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Invierte con certeza',
    description: 'Formaliza tu inversión con respaldo legal y acompañamiento profesional.',
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-primary text-primary-foreground">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 block">
            Proceso simple
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Invertir en bienes raíces nunca fue tan sencillo. Te acompañamos en cada paso del camino.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-gradient-to-r from-accent/50 to-transparent -translate-x-1/2" />
              )}
              
              <div className="text-center">
                {/* Icon */}
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-accent" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="font-serif text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-primary-foreground/70 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
