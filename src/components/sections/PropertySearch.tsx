import { useState } from 'react';
import { Search, MapPin, Home, DollarSign, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CURRENCIES, PRICE_RANGES, emptyFilters, type SearchFilters } from '@/lib/properties';

interface PropertySearchProps {
  onSearch?: (filters: SearchFilters) => void;
}

const PropertySearch = ({ onSearch }: PropertySearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    // Los rangos dependen de la moneda: al cambiarla se reinicia el rango
    if (field === 'currency') newFilters.priceRange = '';
    setFilters(newFilters);
    // Auto-search on change for real-time filtering
    onSearch?.(newFilters);
  };

  const handleSearch = () => {
    onSearch?.(filters);
    // Scroll to properties section
    const propertiesSection = document.getElementById('propiedades');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative -mt-12 md:-mt-16 z-20 pb-4 md:pb-12">
      <div className="container">
        <div className="bg-background rounded-lg shadow-lg border border-border p-4 md:p-8">
          <h2 className="font-sans text-lg md:text-2xl font-medium text-center mb-4 md:mb-6">
            Encuentra tu propiedad ideal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            {/* Property Type */}
            <div className="relative">
              <label className="sr-only md:not-sr-only md:block text-sm font-medium text-muted-foreground md:mb-2">
                Tipo de propiedad
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  className="w-full h-12 pl-10 pr-9 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                >
                  <option value="">Todos</option>
                  <option value="casa">Casa</option>
                  <option value="oficina">Oficina</option>
                  <option value="lote">Lote Residencial</option>
                  <option value="inversion">Terreno de Inversión</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="sr-only md:not-sr-only md:block text-sm font-medium text-muted-foreground md:mb-2">
                Ubicación
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <select
                  value={filters.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full h-12 pl-10 pr-9 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                >
                  <option value="">Todas las ubicaciones</option>
                  <option value="ensenada">Ensenada</option>
                  <option value="rosarito">Rosarito</option>
                  <option value="tijuana">Tijuana</option>
                  <option value="san-quintin">San Quintín</option>
                  <option value="valle-guadalupe">Valle de Guadalupe</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Moneda + rango de precio (sin conversión: el rango aplica a la moneda elegida) */}
            <div className="relative">
              <span className="sr-only md:not-sr-only md:block text-sm font-medium text-muted-foreground md:mb-2">
                Precio
              </span>
              <div className="flex gap-2">
                <div className="relative w-28 shrink-0">
                  <label htmlFor="search-currency" className="sr-only">Moneda</label>
                  <select
                    id="search-currency"
                    value={filters.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full h-12 pl-3 pr-8 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer"
                  >
                    <option value="">Moneda</option>
                    {CURRENCIES.map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="relative min-w-0 flex-1">
                  <label htmlFor="search-price" className="sr-only">Rango de precio</label>
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <select
                    id="search-price"
                    value={filters.priceRange}
                    onChange={(e) => handleChange('priceRange', e.target.value)}
                    disabled={!filters.currency}
                    className="w-full h-12 pl-10 pr-9 bg-secondary border-0 rounded-sm text-foreground focus:ring-2 focus:ring-accent appearance-none cursor-pointer disabled:cursor-not-allowed disabled:text-muted-foreground truncate"
                  >
                    <option value="">{filters.currency ? 'Cualquier precio' : 'Elige moneda'}</option>
                    {filters.currency &&
                      PRICE_RANGES[filters.currency].map((range) => (
                        <option key={range.value} value={range.value}>{range.label}</option>
                      ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                variant="gold"
                size="lg"
                className="w-full h-12"
                onClick={handleSearch}
              >
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
