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
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 block">
            Nuestra propuesta
          </span>
          <h2 className="section-title">¿Por qué invertir con Heredia Land Baja?</h2>
          <p className="section-subtitle mx-auto">
            Más de 15 años respaldando las inversiones inmobiliarias más inteligentes en Baja California
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 bg-secondary/50 rounded-lg hover:bg-secondary transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <benefit.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-medium mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInvest;
