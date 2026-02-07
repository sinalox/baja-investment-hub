import { useState, useEffect } from 'react';
import { MapPin, BedDouble, Bath, Maximize, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Fallback images for properties without images
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';

const fallbackImages = [property1, property2, property3, property4];

type Property = Database['public']['Tables']['properties']['Row'];

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'casa', label: 'Casas' },
  { id: 'oficina', label: 'Oficinas' },
  { id: 'lote', label: 'Lotes Residenciales' },
  { id: 'inversion', label: 'Inversión' },
];

const typeLabels: Record<string, string> = {
  casa: 'Casa',
  oficina: 'Oficina',
  lote: 'Lote Residencial',
  inversion: 'Inversión',
};

const Properties = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data || []);
      }
      setLoading(false);
    };

    fetchProperties();
  }, []);

  const filteredProperties = activeCategory === 'all'
    ? properties
    : properties.filter(p => p.type === activeCategory);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyImage = (property: Property, index: number) => {
    return property.image_url || fallbackImages[index % fallbackImages.length];
  };

  return (
    <section id="propiedades" className="section-padding bg-secondary/50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 block">
            Portafolio
          </span>
          <h2 className="section-title">Propiedades en venta</h2>
          <p className="section-subtitle mx-auto">
            Descubre nuestra selección de propiedades premium en las mejores ubicaciones de Baja California
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-sm text-sm font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-muted'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay propiedades disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className="property-card bg-background rounded-lg overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getPropertyImage(property, index)}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {property.featured && (
                    <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold rounded-sm">
                      Destacado
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium rounded-sm">
                    {typeLabels[property.type] || property.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-medium mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                    {property.beds && (
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4" />
                        {property.beds}
                      </div>
                    )}
                    {property.baths && (
                      <div className="flex items-center gap-1.5">
                        <Bath className="h-4 w-4" />
                        {property.baths}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Maximize className="h-4 w-4" />
                      {property.area}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="font-serif text-lg font-semibold text-foreground">
                      {formatPrice(Number(property.price), property.currency)}
                    </div>
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                      Ver detalles
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="dark" size="lg">
            Ver todas las propiedades
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Properties;
