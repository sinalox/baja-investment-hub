import { Shield, TrendingUp, Search, Users, Target } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Certeza legal',
    description: 'Todas nuestras propiedades cuentan con documentación legal verificada y escrituras en orden.',
  },
  {
    icon: TrendingUp,
    title: 'Alta plusvalía',
    description: 'Propiedades en zonas estratégicas con proyección de crecimiento sostenido.',
  },
  {
    icon: Search,
    title: 'Proyectos seleccionados',
    description: 'Curación rigurosa de desarrollos que cumplen con nuestros estándares de calidad.',
  },
  {
    icon: Users,
    title: 'Asesoría personalizada',
    description: 'Acompañamiento experto durante todo el proceso de compra e inversión.',
  },
  {
    icon: Target,
    title: 'Enfoque patrimonial',
    description: 'Estrategias de inversión diseñadas para construir patrimonio a largo plazo.',
  },
];

const WhyInvest = () => {
  return (
    <section id="nosotros" className="section-padding bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <span className="text-accent text-xs md:text-sm font-semibold tracking-widest uppercase mb-2 md:mb-4 block">
            Nuestra propuesta
          </span>
          <h2 className="section-title">¿Por qué invertir con Heredia Land Baja?</h2>
          <p className="section-subtitle mx-auto">
            Más de 15 años respaldando las inversiones inmobiliarias más inteligentes en Baja California
          </p>
        </div>

        {/* Benefits Grid: 2 columnas compactas en móvil */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-4 md:p-8 bg-secondary/50 rounded-lg hover:bg-secondary transition-all duration-300 hover:-translate-y-1 last:col-span-2 lg:last:col-span-1"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-3 md:mb-6 group-hover:bg-accent/20 transition-colors">
                <benefit.icon className="h-5 w-5 md:h-7 md:w-7 text-accent" />
              </div>
              <h3 className="font-sans text-base md:text-xl font-medium mb-1.5 md:mb-3 leading-snug">{benefit.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInvest;
