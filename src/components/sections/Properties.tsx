import { useState } from 'react';
import { MapPin, BedDouble, Bath, Maximize, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';

const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'casas', label: 'Casas' },
  { id: 'oficinas', label: 'Oficinas' },
  { id: 'lotes', label: 'Lotes Residenciales' },
  { id: 'inversion', label: 'Inversión' },
];

const properties = [
  {
    id: 1,
    title: 'Villa Oceánica Premium',
    type: 'Casa',
    category: 'casas',
    location: 'Ensenada, Baja California',
    price: '$8,500,000 MXN',
    image: property1,
    beds: 4,
    baths: 3,
    area: '350 m²',
    featured: true,
  },
  {
    id: 2,
    title: 'Oficina Ejecutiva Plaza Mar',
    type: 'Oficina',
    category: 'oficinas',
    location: 'Tijuana, Baja California',
    price: '$3,200,000 MXN',
    image: property2,
    area: '180 m²',
    featured: false,
  },
  {
    id: 3,
    title: 'Lote Residencial Vista Pacífico',
    type: 'Lote Residencial',
    category: 'lotes',
    location: 'Rosarito, Baja California',
    price: '$1,850,000 MXN',
    image: property3,
    area: '800 m²',
    featured: false,
  },
  {
    id: 4,
    title: 'Terreno Frente al Mar',
    type: 'Inversión',
    category: 'inversion',
    location: 'San Quintín, Baja California',
    price: '$4,500,000 MXN',
    image: property4,
    area: '2,500 m²',
    featured: true,
  },
];

const Properties = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProperties = activeCategory === 'all'
    ? properties
    : properties.filter(p => p.category === activeCategory);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="property-card bg-background rounded-lg overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {property.featured && (
                  <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold rounded-sm">
                    Destacado
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs font-medium rounded-sm">
                  {property.type}
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
                    {property.price}
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
