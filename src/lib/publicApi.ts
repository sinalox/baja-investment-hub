import type { Database } from '@/integrations/supabase/types';

// Acceso de solo lectura/inserción para las páginas públicas usando la API
// REST de Supabase directamente. Evita cargar @supabase/supabase-js (auth,
// realtime, storage) en el bundle de la landing; el admin sí usa el cliente.
//
// Las propiedades se leen SOLO de la vista public_properties, que expone los
// campos públicos (P) y los P* activados de la ficha técnica. Nunca de la
// tabla properties ni con select=*.

type ViewRow = Database['public']['Views']['public_properties']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];

// En la vista todas las columnas aparecen como nullables, pero estas son
// NOT NULL en la tabla base
type RequiredColumns =
  | 'id' | 'code' | 'title' | 'type' | 'status' | 'featured' | 'location' | 'area'
  | 'price' | 'currency' | 'images' | 'lot_type' | 'differentiators' | 'services';

export type PublicProperty = Omit<ViewRow, RequiredColumns> & {
  [K in RequiredColumns]: NonNullable<ViewRow[K]>;
};

// Lista explícita (regla del proyecto: nunca select=*)
export const PUBLIC_PROPERTY_COLUMNS = [
  'id', 'code', 'title', 'type', 'status', 'featured',
  'location', 'arrival_reference', 'distances', 'access_status', 'maps_url',
  'area', 'area_m2', 'built_area_m2', 'frontage_m', 'depth_m', 'measures_note', 'lot_type', 'topography',
  'land_use', 'beds', 'baths',
  'price', 'currency', 'price_updated_at',
  'down_payment', 'term_months', 'monthly_payment', 'interest_and_fees',
  'payment_requirements', 'buyer_costs_status', 'buyer_costs',
  'tenure_type', 'services',
  'description', 'differentiators', 'cta',
  'images', 'image_url', 'video_url',
] as const satisfies readonly (keyof ViewRow)[];

const SELECT = PUBLIC_PROPERTY_COLUMNS.join(',');

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

const request = async (path: string, init?: RequestInit) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  return res;
};

// Disponibles primero (active < reserved < sold), luego destacadas
export const fetchPublicProperties = async (): Promise<PublicProperty[]> => {
  const res = await request(
    `public_properties?select=${SELECT}&order=status.asc,featured.desc,code.desc`,
  );
  return res.json();
};

export const fetchProperty = async (id: string): Promise<PublicProperty | null> => {
  const res = await request(
    `public_properties?select=${SELECT}&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  const rows: PublicProperty[] = await res.json();
  return rows[0] ?? null;
};

export const insertLead = async (lead: LeadInsert) => {
  await request('leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(lead),
  });
};
