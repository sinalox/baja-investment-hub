import { describe, it, expect } from 'vitest';
import {
  filterProperties,
  parsePriceRange,
  formatPrice,
  formatAmount,
  formatArea,
  getTypeLabel,
  emptyFilters,
  getPropertyImages,
  moveItem,
  PRICE_RANGES,
  formatDate,
  formatMeasures,
  getVideoSource,
} from './properties';

const properties = [
  { id: '1', type: 'casa', location: 'Ensenada, B.C.', price: 1500000, currency: 'MXN' },
  { id: '2', type: 'lote', location: 'Valle de Guadalupe', price: 400000, currency: 'MXN' },
  { id: '3', type: 'oficina', location: 'Tijuana', price: 6000000, currency: 'MXN' },
  { id: '4', type: 'casa', location: 'San Quintín', price: 900000, currency: 'MXN' },
  { id: '5', type: 'lote', location: 'Rosarito', price: 90000, currency: 'USD' },
  { id: '6', type: 'casa', location: 'Rosarito', price: 450000, currency: 'USD' },
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
    expect(ids(filterProperties(properties, 'all', emptyFilters))).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('filters by category tab', () => {
    expect(ids(filterProperties(properties, 'casa'))).toEqual(['1', '4', '6']);
  });

  it('filters by location keywords, ignoring accents variants', () => {
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, location: 'valle-guadalupe' }))).toEqual(['2']);
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, location: 'san-quintin' }))).toEqual(['4']);
  });

  it('filters by currency without converting', () => {
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, currency: 'USD' }))).toEqual(['5', '6']);
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, currency: 'MXN' }))).toEqual(['1', '2', '3', '4']);
  });

  it('applies the price range within the chosen currency', () => {
    expect(
      ids(filterProperties(properties, 'all', { ...emptyFilters, currency: 'MXN', priceRange: '500000-1000000' })),
    ).toEqual(['4']);
    // 450,000 USD no entra en un rango MXN aunque el número coincida
    expect(
      ids(filterProperties(properties, 'all', { ...emptyFilters, currency: 'USD', priceRange: '0-100000' })),
    ).toEqual(['5']);
  });

  it('includes properties above the open-ended price range', () => {
    expect(
      ids(filterProperties(properties, 'all', { ...emptyFilters, currency: 'MXN', priceRange: '5000000+' })),
    ).toEqual(['3']);
  });

  it('ignores a price range when no currency is chosen', () => {
    expect(ids(filterProperties(properties, 'all', { ...emptyFilters, priceRange: '0-100000' }))).toHaveLength(6);
  });

  it('combines type, currency and price filters', () => {
    expect(
      ids(
        filterProperties(properties, 'all', {
          ...emptyFilters,
          propertyType: 'casa',
          currency: 'MXN',
          priceRange: '1000000-2000000',
        }),
      ),
    ).toEqual(['1']);
  });

  it('has price ranges for every currency', () => {
    expect(Object.keys(PRICE_RANGES)).toEqual(['MXN', 'USD']);
  });
});

describe('formatPrice', () => {
  it('always includes the currency code', () => {
    expect(formatPrice(1500000, 'MXN')).toBe('$1,500,000 MXN');
    expect(formatPrice(90000, 'USD')).toBe('$90,000 USD');
  });

  it('keeps cents when present', () => {
    expect(formatPrice(1234.5, 'USD')).toBe('$1,234.5 USD');
  });

  it('formatAmount omits the code (only for use next to a visible currency)', () => {
    expect(formatAmount(4450000)).toBe('$4,450,000');
  });
});

describe('formatArea', () => {
  it('prefers numeric m²', () => {
    expect(formatArea({ area_m2: 187, area: '187' })).toBe('187 m²');
    expect(formatArea({ area_m2: 1250.5, area: 'x' })).toBe('1,250.5 m²');
  });

  it('falls back to the legacy text', () => {
    expect(formatArea({ area_m2: null, area: '300 m2 aprox' })).toBe('300 m2 aprox');
  });
});

describe('getTypeLabel', () => {
  it('uses the shared labels and falls back to the raw value', () => {
    expect(getTypeLabel('inversion')).toBe('Terreno de inversión');
    expect(getTypeLabel('bodega')).toBe('bodega');
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

describe('formatDate', () => {
  it('formats ISO dates as dd/mm/aaaa without timezone shifts', () => {
    expect(formatDate('2026-10-26')).toBe('26/10/2026');
    expect(formatDate('2026-01-01T00:00:00Z')).toBe('01/01/2026');
    expect(formatDate(null)).toBe('');
  });
});

describe('formatMeasures', () => {
  it('formats frontage × depth only when both exist', () => {
    expect(formatMeasures(16, 25)).toBe('16 × 25 m');
    expect(formatMeasures(12.5, 30)).toBe('12.5 × 30 m');
    expect(formatMeasures(16, null)).toBe('');
  });
});

describe('getVideoSource', () => {
  it('embeds YouTube (watch, short link, shorts) without tracking cookies', () => {
    const embed = { kind: 'embed', src: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' };
    expect(getVideoSource('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual(embed);
    expect(getVideoSource('https://youtu.be/dQw4w9WgXcQ?t=3')).toEqual(embed);
    expect(getVideoSource('https://youtube.com/shorts/dQw4w9WgXcQ')).toEqual(embed);
  });

  it('embeds Vimeo', () => {
    expect(getVideoSource('https://vimeo.com/123456')).toEqual({ kind: 'embed', src: 'https://player.vimeo.com/video/123456' });
  });

  it('shows other links as a button and rejects non-http values', () => {
    expect(getVideoSource('https://drive.google.com/file/d/x')).toEqual({ kind: 'link', href: 'https://drive.google.com/file/d/x' });
    expect(getVideoSource('javascript:alert(1)')).toBeNull();
    expect(getVideoSource('')).toBeNull();
  });
});
