import { describe, it, expect } from 'vitest';
import { fileName, filledRows } from './theme';

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
