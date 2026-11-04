import { describe, it, expect } from 'vitest';
import {
  fichaSchema,
  isVerificationExpired,
  toDocumentRows,
  toFormValues,
  toPropertyPayload,
  toRecordPayload,
  toServiceRows,
  type FichaValues,
  type PropertyRow,
  type RecordRow,
} from './schema';

const baseValues = (): FichaValues => {
  const values = toFormValues();
  values.property.title = 'Lote Vista Mar';
  values.property.type = 'lote';
  values.property.location = 'Rosarito';
  values.property.price = '90000';
  values.property.currency = 'USD';
  return values;
};

const errorsOf = (values: FichaValues) => {
  const result = fichaSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('toFormValues', () => {
  it('gives a valid-shaped empty form with every service and document', () => {
    const values = toFormValues();
    expect(Object.keys(values.services)).toHaveLength(7);
    expect(Object.keys(values.documents)).toHaveLength(9);
    expect(values.property.differentiators).toEqual(['', '', '']);
    expect(values.services.agua.status).toBe('por_confirmar');
  });

  it('maps database rows (numbers, nulls, dates) to strings', () => {
    const property = {
      title: 'Casa', type: 'casa', location: 'Tijuana', price: 4450000, currency: 'MXN',
      area_m2: 187, beds: 3, baths: null, images: [], image_url: 'a.jpg', differentiators: ['Esquina'],
      lot_type: ['esquina'], featured: true,
    } as unknown as PropertyRow;
    const record = { price_verified_at: '2026-10-20', term_months: 24, financing_confirmed: true } as unknown as RecordRow;
    const values = toFormValues(property, record, [
      { property_id: 'x', service: 'agua', status: 'instalado_en_lote', evidence_note: 'Recibo' },
    ]);
    expect(values.property.area_m2).toBe('187');
    expect(values.property.baths).toBe('');
    expect(values.property.images).toEqual(['a.jpg']); // propiedades viejas: image_url
    expect(values.property.differentiators).toEqual(['Esquina', '', '']);
    expect(values.record.term_months).toBe('24');
    expect(values.record.price_verified_at).toBe('2026-10-20');
    expect(values.services.agua).toEqual({ status: 'instalado_en_lote', evidence_note: 'Recibo' });
  });
});

describe('fichaSchema', () => {
  it('accepts a minimal draft (only what the database requires)', () => {
    expect(errorsOf(baseValues())).toEqual([]);
  });

  it('requires title, location and a positive price', () => {
    const values = baseValues();
    values.property.title = ' ';
    values.property.location = '';
    values.property.price = '0';
    expect(errorsOf(values).map((e) => e.split(':')[0])).toEqual([
      'property.title', 'property.location', 'property.price',
    ]);
  });

  it('rejects invalid numbers and links', () => {
    const values = baseValues();
    values.property.area_m2 = '-5';
    values.record.term_months = '1.5';
    values.property.video_url = 'youtube.com/x';
    values.record.drive_url = 'javascript:alert(1)';
    expect(errorsOf(values).map((e) => e.split(':')[0]).sort()).toEqual([
      'property.area_m2', 'property.video_url', 'record.drive_url', 'record.term_months',
    ]);
  });

  it('requires evidence to mark a service as installed (same rule as the database)', () => {
    const values = baseValues();
    values.services.agua.status = 'instalado_en_lote';
    expect(errorsOf(values)).toEqual([
      'services.agua.evidence_note: La evidencia es obligatoria para marcarlo como instalado',
    ]);
    values.services.agua.evidence_note = 'Recibo CESPT';
    expect(errorsOf(values)).toEqual([]);
  });

  it('does not allow publishing financing without amounts', () => {
    const values = baseValues();
    values.record.financing_confirmed = true;
    expect(errorsOf(values)[0]).toMatch(/^record.financing_confirmed/);
    values.record.monthly_payment = '5000';
    expect(errorsOf(values)).toEqual([]);
  });
});

describe('toPropertyPayload', () => {
  it('converts strings, trims, nulls empties and never sends status or code', () => {
    const values = baseValues();
    values.property.area_m2 = '300';
    values.property.arrival_reference = '  Km 30  ';
    values.property.distances = '   ';
    values.property.differentiators = [' Vista al mar ', '', 'Esquina'];
    values.property.images = ['a.webp', 'b.webp'];
    const payload = toPropertyPayload(values);
    expect(payload).not.toHaveProperty('status');
    expect(payload).not.toHaveProperty('code');
    expect(payload.price).toBe(90000);
    expect(payload.area_m2).toBe(300);
    expect(payload.area).toBe('300 m²');
    expect(payload.arrival_reference).toBe('Km 30');
    expect(payload.distances).toBeNull();
    expect(payload.differentiators).toEqual(['Vista al mar', 'Esquina']);
    expect(payload.image_url).toBe('a.webp');
    expect(payload.category).toBe('lote');
  });

  it('keeps the legacy area text when there are no m²', () => {
    expect(toPropertyPayload(baseValues(), '187').area).toBe('187');
  });
});

describe('toRecordPayload', () => {
  it('never sends workflow_status (only the publish panel changes it)', () => {
    const payload = toRecordPayload(baseValues());
    expect(payload).not.toHaveProperty('workflow_status');
    expect(payload).not.toHaveProperty('ficha_version');
    expect(payload.contract_type).toBeNull();
    expect(payload.price_verified_at).toBeNull();
  });
});

describe('service and document rows', () => {
  it('produces one row per service and document', () => {
    const values = baseValues();
    values.services.agua = { status: 'instalado_en_lote', evidence_note: ' Recibo ' };
    values.documents.escritura = { received: true, reviewed: true, reviewed_at: '2026-10-01', note: '' };
    const services = toServiceRows('p1', values);
    const documents = toDocumentRows('p1', values);
    expect(services).toHaveLength(7);
    expect(services[0]).toEqual({ property_id: 'p1', service: 'agua', status: 'instalado_en_lote', evidence_note: 'Recibo' });
    expect(documents).toHaveLength(9);
    expect(documents[0]).toEqual({
      property_id: 'p1', doc_type: 'escritura', received: true, reviewed: true, reviewed_at: '2026-10-01', note: null,
    });
  });
});

describe('isVerificationExpired', () => {
  const today = new Date('2026-10-26T12:00:00');
  it('marks missing or old verifications', () => {
    expect(isVerificationExpired(null, 15, today)).toBe(true);
    expect(isVerificationExpired('2026-10-10', 15, today)).toBe(true);
    expect(isVerificationExpired('2026-10-11', 15, today)).toBe(false);
    expect(isVerificationExpired('2026-10-26', 15, today)).toBe(false);
  });
});
