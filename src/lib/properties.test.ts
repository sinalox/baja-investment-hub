import { describe, it, expect } from 'vitest';
import { filterProperties, parsePriceRange, formatPrice, emptyFilters, getPropertyImages, moveItem } from './properties';

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

describe('getPropertyImages', () => {
  it('uses the gallery when present', () => {
    expect(getPropertyImages({ image_url: 'a.jpg', images: ['a.jpg', 'b.jpg'] })).toEqual(['a.jpg', 'b.jpg']);
  });

  it('falls back to image_url for older properties', () => {
    expect(getPropertyImages({ image_url: 'a.jpg', images: [] })).toEqual(['a.jpg']);
    expect(getPropertyImages({ image_url: 'a.jpg' })).toEqual(['a.jpg']);
  });

  it('returns an empty list when there are no images', () => {
    expect(getPropertyImages({ image_url: null, images: [] })).toEqual([]);
  });
});

describe('moveItem', () => {
  it('moves an item to the front', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('ignores out of range moves', () => {
    const items = ['a', 'b'];
    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 1, 2)).toBe(items);
  });
});
