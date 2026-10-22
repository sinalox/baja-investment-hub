import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/publicApi', () => ({ insertLead: vi.fn() }));

import { buildPublicLead, getFieldErrors, isBotSubmission, publicLeadSchema } from './leads';

const valid = {
  name: 'Ana López',
  phone: '6461112233',
  email: '',
  property_type: 'casa',
  message: '',
};

describe('publicLeadSchema', () => {
  it('accepts a valid lead with empty optional fields', () => {
    expect(publicLeadSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects unknown property types', () => {
    const result = publicLeadSchema.safeParse({ ...valid, property_type: 'yate' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getFieldErrors(result.error).property_type).toBe('Selecciona un tipo de propiedad');
    }
  });

  it('rejects invalid email and too long name', () => {
    const result = publicLeadSchema.safeParse({ ...valid, email: 'no-es-email', name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = getFieldErrors(result.error);
      expect(errors.email).toBe('Email inválido');
      expect(errors.name).toBe('El nombre es muy largo');
    }
  });

  it('trims whitespace', () => {
    const result = publicLeadSchema.parse({ ...valid, name: '  Ana  ' });
    expect(result.name).toBe('Ana');
  });
});

describe('buildPublicLead', () => {
  it('builds a row that satisfies the public RLS policy', () => {
    const data = publicLeadSchema.parse({ ...valid, message: 'Busco casa' });
    expect(buildPublicLead(data, 'formulario_web')).toEqual({
      name: 'Ana López',
      phone: '6461112233',
      email: null,
      property_type: 'casa',
      notes: 'Busco casa',
      status: 'nuevo',
      source: 'formulario_web',
    });
  });

  it('prepends the property summary to the notes', () => {
    const data = publicLeadSchema.parse({ ...valid, message: 'Hola' });
    expect(buildPublicLead(data, 'pagina_propiedad', 'Interesado en: Casa X').notes).toBe(
      'Interesado en: Casa X\n\nHola',
    );
  });

  it('stores null notes when there is nothing to save', () => {
    const data = publicLeadSchema.parse(valid);
    expect(buildPublicLead(data, 'formulario_web').notes).toBeNull();
  });
});

describe('isBotSubmission', () => {
  it('flags filled honeypots only', () => {
    expect(isBotSubmission('')).toBe(false);
    expect(isBotSubmission(undefined)).toBe(false);
    expect(isBotSubmission('http://spam.example')).toBe(true);
  });
});
