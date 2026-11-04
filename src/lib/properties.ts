import type { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];

// ---------------------------------------------------------------------------
// Etiquetas de la ficha técnica (docs/ficha-tecnica-spec.md). Los valores
// coinciden con los CHECK de la migración 20261026120000_ficha_tecnica.sql.
// ---------------------------------------------------------------------------

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: 'Casa',
  oficina: 'Oficina',
  lote: 'Lote residencial',
  inversion: 'Terreno de inversión',
};

export const getTypeLabel = (type: string) => PROPERTY_TYPE_LABELS[type] ?? type;

// Estado visible al público (properties.status, calculado desde el flujo)
export const PUBLIC_STATUS_LABELS: Record<string, string> = {
  reserved: 'Apartada',
  sold: 'Vendida',
};

export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  borrador: 'Borrador',
  en_validacion: 'En validación',
  listo: 'Listo para publicar',
  publicada: 'Publicada',
  apartada: 'Apartada',
  vendida: 'Vendida',
  pausada: 'Pausada',
  retirada: 'Retirada',
};

export const ACCESS_STATUS_LABELS: Record<string, string> = {
  pavimentado: 'Pavimentado',
  terraceria: 'Terracería',
  otro: 'Otro',
  por_confirmar: 'Por confirmar',
};

export const LOT_TYPE_LABELS: Record<string, string> = {
  esquina: 'Esquina',
  intermedio: 'Intermedio',
  frente_al_mar: 'Frente al mar',
  vista_al_mar: 'Vista al mar',
};

export const SERVICE_LABELS: Record<string, string> = {
  agua: 'Agua',
  electricidad: 'Electricidad',
  drenaje: 'Drenaje',
  alumbrado_publico: 'Alumbrado público',
  calle_pavimentada: 'Calle pavimentada',
  internet: 'Internet',
  gas: 'Gas',
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  instalado_en_lote: 'Instalado en el lote',
  en_la_zona: 'Disponible en la zona',
  no_hay: 'No hay',
  por_confirmar: 'Por confirmar',
};

export const TENURE_LABELS: Record<string, string> = {
  privada: 'Propiedad privada',
  ejidal: 'Ejidal',
  comunal: 'Comunal',
  fideicomiso: 'Fideicomiso',
  otra: 'Otra',
  por_confirmar: 'Por confirmar',
};

export const DOCUMENT_LABELS: Record<string, string> = {
  escritura: 'Escritura',
  libertad_gravamen: 'Certificado de libertad de gravamen',
  predial: 'Predial',
  identificacion_poderes: 'Identificación / poderes',
  plano: 'Plano',
  uso_suelo: 'Uso de suelo',
  evidencia_servicios: 'Evidencia de servicios',
  contrato_firmado: 'Contrato firmado',
  aprobacion_precio: 'Aprobación escrita de precio',
};

// ---------------------------------------------------------------------------
// Moneda: cada propiedad en su moneda, sin conversión. El precio siempre se
// muestra con su código.
// ---------------------------------------------------------------------------

export const CURRENCIES = ['MXN', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

// "$4,450,000" (sin código: solo para usarse junto a la moneda visible)
export const formatAmount = (price: number) =>
  `$${new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)}`;

// "$4,450,000 MXN" / "$90,000 USD"
export const formatPrice = (price: number, currency: string) =>
  `${formatAmount(price)} ${currency}`;

// Rangos del buscador por moneda: el filtro de precio solo aplica cuando hay
// una moneda elegida
export const PRICE_RANGES: Record<Currency, { value: string; label: string }[]> = {
  MXN: [
    { value: '0-500000', label: 'Hasta $500,000 MXN' },
    { value: '500000-1000000', label: '$500,000 - $1,000,000 MXN' },
    { value: '1000000-2000000', label: '$1,000,000 - $2,000,000 MXN' },
    { value: '2000000-5000000', label: '$2,000,000 - $5,000,000 MXN' },
    { value: '5000000+', label: 'Más de $5,000,000 MXN' },
  ],
  USD: [
    { value: '0-100000', label: 'Hasta $100,000 USD' },
    { value: '100000-250000', label: '$100,000 - $250,000 USD' },
    { value: '250000-500000', label: '$250,000 - $500,000 USD' },
    { value: '500000-1000000', label: '$500,000 - $1,000,000 USD' },
    { value: '1000000+', label: 'Más de $1,000,000 USD' },
  ],
};

// Superficie: m² numérico de la ficha; si no existe, el texto anterior
export const formatArea = (property: { area_m2?: number | null; area?: string | null }) => {
  if (property.area_m2 != null) {
    return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(property.area_m2)} m²`;
  }
  return property.area ?? '';
};

// ---------------------------------------------------------------------------
// Búsqueda y filtros del catálogo
// ---------------------------------------------------------------------------

export interface SearchFilters {
  propertyType: string;
  location: string;
  currency: '' | Currency;
  priceRange: string;
}

export const emptyFilters: SearchFilters = {
  propertyType: '',
  location: '',
  currency: '',
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

export const filterProperties = <T extends Pick<Property, 'type' | 'location' | 'price' | 'currency'>>(
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

  if (filters?.currency) {
    result = result.filter((p) => p.currency === filters.currency);

    // Sin moneda elegida un rango de precio no tiene sentido (no se convierte)
    if (filters.priceRange) {
      const [min, max] = parsePriceRange(filters.priceRange);
      result = result.filter((p) => {
        const price = Number(p.price);
        return price >= min && price <= max;
      });
    }
  }

  return result;
};

// ---------------------------------------------------------------------------
// Galería
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Ficha pública
// ---------------------------------------------------------------------------

// "2026-10-26" -> "26/10/2026" (sin pasar por Date: evita corrimientos de zona)
export const formatDate = (isoDate: string | null | undefined) => {
  const match = isoDate?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
};

// "16 × 25 m"
export const formatMeasures = (frontage: number | null | undefined, depth: number | null | undefined) => {
  if (frontage == null || depth == null) return '';
  const n = (v: number) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(v);
  return `${n(frontage)} × ${n(depth)} m`;
};

// YouTube y Vimeo se embeben; cualquier otro enlace se muestra como botón
export type VideoSource = { kind: 'embed'; src: string } | { kind: 'link'; href: string };

export const getVideoSource = (url: string | null | undefined): VideoSource | null => {
  if (!url || !/^https?:\/\//i.test(url.trim())) return null;
  const value = url.trim();
  const youtube = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (youtube) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${youtube[1]}` };
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { kind: 'link', href: value };
};
