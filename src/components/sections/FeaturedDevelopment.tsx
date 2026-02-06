import { Button } from '@/components/ui/button';
import { ArrowRight, Check, TrendingUp, Shield, MapPin } from 'lucide-react';
import featuredDev from '@/assets/featured-development.jpg';

const features = [
  { icon: TrendingUp, text: 'Plusvalía anual del 12-15%' },
  { icon: Shield, text: 'Certeza legal garantizada' },
  { icon: MapPin, text: 'Ubicación premium frente al mar' },
];

const FeaturedDevelopment = () => {
  return (
    <section id="desarrollos" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={featuredDev}
          alt="Desarrollo costero premium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 block">
              Proyecto Destacado
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              Costa Pacífico
              <br />
              <span className="text-accent">Residencial</span>
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Exclusivo desarrollo de lotes residenciales frente al mar en una de las zonas 
              con mayor crecimiento de Baja California. Financiamiento disponible hasta 60 meses.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-sm">
              <div className="text-sm text-white/70 mb-1">Lotes desde</div>
              <div className="font-serif text-3xl font-semibold mb-2">$1,200,000 MXN</div>
              <div className="text-sm text-white/70">
                o desde <span className="text-accent font-semibold">$25,000 MXN/mes</span>
              </div>
            </div>

            {/* CTA */}
            <Button variant="heroPrimary" size="xl">
              Conocer el proyecto
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side - can add more visual elements if needed */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default FeaturedDevelopment;
