import type { Database } from '@/integrations/supabase/types';

// Acceso de solo lectura/inserción para las páginas públicas usando la API
// REST de Supabase directamente. Evita cargar @supabase/supabase-js (auth,
// realtime, storage) en el bundle de la landing; el admin sí usa el cliente.

type Tables = Database['public']['Tables'];
export type Property = Tables['properties']['Row'];
export type LeadInsert = Tables['leads']['Insert'];

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

export const fetchActiveProperties = async (): Promise<Property[]> => {
  const res = await request(
    'properties?select=*&status=eq.active&order=featured.desc,created_at.desc',
  );
  return res.json();
};

// La política RLS solo devuelve propiedades activas a visitantes anónimos
export const fetchProperty = async (id: string): Promise<Property | null> => {
  const res = await request(`properties?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  const rows: Property[] = await res.json();
  return rows[0] ?? null;
};

export const insertLead = async (lead: LeadInsert) => {
  await request('leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(lead),
  });
};
