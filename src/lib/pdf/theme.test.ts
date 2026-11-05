import { describe, it, expect } from 'vitest';
import { compactText, fileName, filledRows, sanitizeForPdf, toPdfText } from './theme';

describe('fileName', () => {
  it('builds a safe file name without accents or spaces', () => {
    expect(fileName('LB-I001', 'Terreno Otay')).toBe('Ficha-LB-I001-Terreno-Otay.pdf');
    expect(fileName('LB-C002', 'Casa Ñandú / Vista al mar!')).toBe('Ficha-LB-C002-Casa-Nandu-Vista-al-mar.pdf');
    expect(fileName('LB-T001', 'Lote', '-INTERNA')).toBe('Ficha-LB-T001-Lote-INTERNA.pdf');
  });
});

describe('filledRows', () => {
  it('drops empty values so the client sheet never shows blanks', () => {
    expect(filledRows([['Zona', 'Rosarito'], ['Acceso', null], ['Distancias', '  '], ['Uso', false]])).toEqual([
      ['Zona', 'Rosarito'],
    ]);
  });
});

describe('toPdfText', () => {
  it('quita emojis y deja acentos, ñ, ², × y viñetas', () => {
    expect(toPdfText('🏡 CASA REMODELADA EN SANTA FE')).toBe('CASA REMODELADA EN SANTA FE');
    expect(toPdfText('📍 Parque | Escuela\n💲 $4,335,000 MXN')).toBe('Parque | Escuela\n$4,335,000 MXN');
    expect(toPdfText('Año, niño, 187.5 m², 7.5 × 25 m • “lujo” — ok')).toBe('Año, niño, 187.5 m², 7.5 × 25 m • “lujo” — ok');
    expect(toPdfText('🔽 PLANTA BAJA ✅ listo')).toBe('PLANTA BAJA listo');
  });

  it('limpia los campos de texto y listas de un objeto sin tocar números', () => {
    expect(sanitizeForPdf({ title: '🏡 Casa', price: 10, tags: ['✅ Esquina'], images: ['a.webp'] }))
      .toEqual({ title: 'Casa', price: 10, tags: ['Esquina'], images: ['a.webp'] });
  });
});

describe('compactText', () => {
  it('junta viñetas separadas por líneas en blanco y limita los saltos', () => {
    expect(compactText('PLANTA BAJA\n\n• Cochera\n\n• Recibidor\n\n\n\nPLANTA ALTA'))
      .toBe('PLANTA BAJA\n• Cochera\n• Recibidor\n\nPLANTA ALTA');
  });
});
