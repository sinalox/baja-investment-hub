import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import heroBaja from '@/assets/hero-baja.jpg';

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBaja}
          alt="Desarrollo costero en Baja California"
          className="w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm font-medium tracking-wide">Inversiones Premium en Baja California</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-tight mb-6 animate-fade-in-up">
            Invierte con certeza
            <br />
            <span className="text-accent">en Baja California</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/85 max-w-2xl mx-auto mb-10 animate-fade-in-up opacity-0 delay-200">
            Terrenos y propiedades con alto potencial de plusvalía
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up opacity-0 delay-300">
            <Button variant="heroPrimary" size="xl" className="w-full sm:w-auto">
              Ver propiedades
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
              Agenda una visita
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-16 pt-16 border-t border-white/20 animate-fade-in opacity-0 delay-500">
            <div>
              <div className="font-serif text-3xl md:text-4xl font-medium mb-1">15+</div>
              <div className="text-sm text-white/70">Años de experiencia</div>
            </div>
            <div>
              <div className="font-serif text-3xl md:text-4xl font-medium mb-1">200+</div>
              <div className="text-sm text-white/70">Propiedades vendidas</div>
            </div>
            <div>
              <div className="font-serif text-3xl md:text-4xl font-medium mb-1">12%</div>
              <div className="text-sm text-white/70">Plusvalía anual</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
