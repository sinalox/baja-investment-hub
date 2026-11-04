import { describe, it, expect } from 'vitest';
import { PUBLIC_PROPERTY_COLUMNS } from './publicApi';

// Columnas internas de la ficha (property_records y evidencias) que nunca
// deben pedirse desde el sitio público
const INTERNAL_COLUMNS = [
  'owner_name', 'owner_contact', 'contract_type', 'contract_valid_until',
  'deed_area_m2', 'real_area_m2', 'measures_differ', 'measures_diff_note',
  'price_valid_until', 'price_verified_at', 'open_alerts', 'docs_reviewed_by', 'docs_reviewed_at',
  'buyer_profile', 'unpublished_notes', 'photos_taken_at', 'drive_url',
  'last_verified_at', 'last_verified_via', 'verified_by', 'approved_by', 'approved_at',
  'ficha_version', 'workflow_status', 'evidence_note', 'reviewed', 'received', 'note',
  // Interruptores P*: deciden qué se publica, no se publican
  'publish_exact_location', 'land_use_confirmed', 'financing_confirmed',
  'publish_payment_requirements', 'publish_buyer_costs', 'publish_tenure',
  // Metadatos de la tabla que no hacen falta en público
  'created_at', 'updated_at', 'category',
];

describe('PUBLIC_PROPERTY_COLUMNS', () => {
  it('no incluye ninguna columna interna', () => {
    const leaked = PUBLIC_PROPERTY_COLUMNS.filter((c) => (INTERNAL_COLUMNS as readonly string[]).includes(c));
    expect(leaked).toEqual([]);
  });

  it('es una lista explícita sin comodines ni duplicados', () => {
    expect(PUBLIC_PROPERTY_COLUMNS).not.toContain('*');
    expect(new Set(PUBLIC_PROPERTY_COLUMNS).size).toBe(PUBLIC_PROPERTY_COLUMNS.length);
  });

  it('incluye lo que la ficha pública necesita', () => {
    for (const column of ['id', 'code', 'title', 'price', 'currency', 'status', 'services', 'price_updated_at']) {
      expect(PUBLIC_PROPERTY_COLUMNS).toContain(column);
    }
  });
});
