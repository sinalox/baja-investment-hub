import type { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];

export interface SearchFilters {
  propertyType: string;
  location: string;
  priceRange: string;
}

export const emptyFilters: SearchFilters = {
  propertyType: '',
  location: '',
  priceRange: '',
};

// Anclas del menú (#casas, #lotes...) -> categoría del catálogo
export const categoryHashes: Record<string, string> = {
  casas: 'casa',
  oficinas: 'oficina',
  lotes: 'lote',
  inversion: 'inversion',
};

const locationKeywords: Record<string, string[]> = {
  ensenada: ['ensenada'],
  rosarito: ['rosarito'],
  tijuana: ['tijuana'],
  'san-quintin': ['san quintín', 'san quintin'],
  'valle-guadalupe': ['valle de guadalupe', 'valle guadalupe'],
};

// "0-500000" -> [0, 500000]; "5000000+" -> [5000000, Infinity]
export const parsePriceRange = (range: string): [number, number] => {
  if (range.endsWith('+')) {
    return [parseInt(range) || 0, Infinity];
  }
  const [min, max] = range.split('-').map((v) => parseInt(v) || 0);
  return [min, max ?? Infinity];
};

export const filterProperties = <T extends Pick<Property, 'type' | 'location' | 'price'>>(
  properties: T[],
  category: string,
  filters?: SearchFilters,
): T[] => {
  let result = properties;

  if (category !== 'all') {
    result = result.filter((p) => p.type === category);
  }

  if (filters?.propertyType) {
    result = result.filter((p) => p.type === filters.propertyType);
  }

  if (filters?.location) {
    const keywords = locationKeywords[filters.location] || [filters.location];
    result = result.filter((p) => {
      const locationLower = p.location.toLowerCase();
      return keywords.some((keyword) => locationLower.includes(keyword));
    });
  }

  if (filters?.priceRange) {
    const [min, max] = parsePriceRange(filters.priceRange);
    result = result.filter((p) => {
      const price = Number(p.price);
      return price >= min && price <= max;
    });
  }

  return result;
};

export const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);

// Galería de la propiedad. Las propiedades anteriores a la galería solo
// tienen image_url, así que se usa como única imagen.
export const getPropertyImages = (property: Pick<Property, 'image_url'> & { images?: string[] | null }) => {
  const images = (property.images ?? []).filter(Boolean);
  if (images.length > 0) return images;
  return property.image_url ? [property.image_url] : [];
};

// Mueve el elemento de `from` a `to` sin mutar el arreglo original
export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length || from === to) return items;
  const result = [...items];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
};
