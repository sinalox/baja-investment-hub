import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PropertySearch = () => {
  return (
    <section className="relative -mt-16 z-20 pb-12">
      <div className="container">
        <div className="bg-background rounded-lg shadow-lg border border-border p-6 md:p-8">
          <h2 className="font-serif text-xl md:text-2xl font-medium text-center mb-6">
            Encuentra tu propiedad ideal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Property Type */}
            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Tipo de propiedad
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select className="w-full h-12 pl-10 pr-4 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer">
                  <option value="">Todos</option>
                  <option value="casa">Casa</option>
                  <option value="oficina">Oficina</option>
                  <option value="lote">Lote Residencial</option>
                  <option value="inversion">Terreno de Inversión</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Ubicación
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select className="w-full h-12 pl-10 pr-4 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer">
                  <option value="">Todas las ubicaciones</option>
                  <option value="ensenada">Ensenada</option>
                  <option value="rosarito">Rosarito</option>
                  <option value="tijuana">Tijuana</option>
                  <option value="san-quintin">San Quintín</option>
                  <option value="valle-guadalupe">Valle de Guadalupe</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="relative">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Rango de precio
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select className="w-full h-12 pl-10 pr-4 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer">
                  <option value="">Cualquier precio</option>
                  <option value="0-500000">Hasta $500,000 MXN</option>
                  <option value="500000-1000000">$500,000 - $1,000,000 MXN</option>
                  <option value="1000000-2000000">$1,000,000 - $2,000,000 MXN</option>
                  <option value="2000000-5000000">$2,000,000 - $5,000,000 MXN</option>
                  <option value="5000000+">$5,000,000+ MXN</option>
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button variant="gold" size="lg" className="w-full h-12">
                <Search className="h-5 w-5" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertySearch;
