import { describe, it, expect } from 'vitest';
import { filterProperties, parsePriceRange, formatPrice, emptyFilters } from './properties';

const properties = [
  { id: '1', type: 'casa', location: 'Ensenada, B.C.', price: 1500000 },
  { id: '2', type: 'lote', location: 'Valle de Guadalupe', price: 400000 },
  { id: '3', type: 'oficina', location: 'Tijuana', price: 6000000 },
  { id: '4', type: 'casa', location: 'San Quintín', price: 900000 },
];

const ids = (list: { id: string }[]) => list.map((p) => p.id);

describe('parsePriceRange', () => {
  it('parses a closed range', () => {
    expect(parsePriceRange('500000-1000000')).toEqual([500000, 1000000]);
  });

  it('parses an open-ended range', () => {
    expect(parsePriceRange('5000000+')).toEqual([5000000, Infinity]);
  });
});

describe('filterProperties', () => {
  it('returns everything with no category and no filters', () => {
    expect(ids(filterProperties(properties, 'all', emptyFilters))).toEqual(['1', '2', '3', '4']);
  });

  it('filters by category tab', () => {
    expect(ids(filterProperties(properties, 'casa'))).toEqual(['1', '4']);
  });

  it('filters by location keywords, ignoring accents variants', () => {
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, location: 'valle-guadalupe' }))).toEqual(['2']);
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, location: 'san-quintin' }))).toEqual(['4']);
  });

  it('filters by closed price range', () => {
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, priceRange: '500000-1000000' }))).toEqual(['4']);
  });

  it('includes properties above the open-ended price range', () => {
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, priceRange: '5000000+' }))).toEqual(['3']);
  });

  it('combines type and price filters', () => {
    expect(
      ids(filterProperties(properties, 'all', { ...emptyFilters, propertyType: 'casa', priceRange: '1000000-2000000' })),
    ).toEqual(['1']);
  });
});

describe('formatPrice', () => {
  it('formats MXN without decimals', () => {
    expect(formatPrice(1500000, 'MXN')).toBe('$1,500,000');
  });
});
