import { Font, StyleSheet } from '@react-pdf/renderer';

// Sin división silábica automática ("grava-men"): las palabras pasan completas a la siguiente línea
Font.registerHyphenationCallback((word) => [word]);

// Colores de la marca (index.css): dorado hsl(38 65% 50%) y casi negro
export const colors = {
  gold: '#D2952D',
  text: '#141414',
  muted: '#6B6B6B',
  border: '#E8E1D8',
  soft: '#F7F3EE',
  red: '#C62828',
  amber: '#D97706',
  green: '#2E7D32',
};

// Helvetica (incluida en el PDF) cubre acentos, ñ, ², × y ·
export const styles = StyleSheet.create({
  page: { paddingTop: 70, paddingBottom: 56, paddingHorizontal: 36, fontFamily: 'Helvetica', fontSize: 10, color: colors.text },
  header: {
    position: 'absolute', top: 22, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerContact: { fontSize: 8, color: colors.muted, textAlign: 'right', lineHeight: 1.4 },
  footer: {
    position: 'absolute', bottom: 20, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between',
    fontSize: 7, color: colors.muted, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 6,
  },
  eyebrow: { fontSize: 8, color: colors.gold, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  subtitle: { fontSize: 10, color: colors.muted, marginTop: 3 },
  sectionTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 12, marginBottom: 4, paddingBottom: 3,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  row: { flexDirection: 'row', paddingVertical: 2 },
  rowLabel: { width: 150, color: colors.muted },
  rowValue: { flex: 1 },
  small: { fontSize: 8, color: colors.muted },
});

// Filas solo con valor (ficha cliente: no se muestran datos vacíos)
export const filledRows = (rows: [string, string | null | undefined | false][]) =>
  rows.filter((r): r is [string, string] => typeof r[1] === 'string' && r[1].trim() !== '');

export const fileName = (code: string, title: string, suffix = '') =>
  `Ficha-${code}-${title}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/-$/, '') + `${suffix}.pdf`;

// Helvetica (fuente estándar del PDF) solo tiene los caracteres de WinAnsi
// (cp1252): los emojis y otros símbolos salen como basura ("<á", "=Í"). Se
// eliminan y se limpian los espacios que dejan. Acentos, ñ, ², ×, • y
// comillas tipográficas sí están.
const CP1252_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const isPdfSafe = (ch: string) => {
  const code = ch.codePointAt(0) ?? 0;
  return ch === '\n' || ch === '\t' || (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)
    || CP1252_EXTRA.includes(ch);
};

export const toPdfText = (value: string) =>
  Array.from(value)
    .filter(isPdfSafe)
    .join('')
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').replace(/^[ \t]+/, '').trimEnd())
    .join('\n');

// Descripciones capturadas con una línea en blanco entre cada viñeta: se
// juntan las viñetas consecutivas y se deja como máximo una línea en blanco
export const compactText = (value: string) =>
  value
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n(?=[•\-*] )/g, '\n');

// Aplica toPdfText a los campos de texto (y listas de texto) de un objeto
export const sanitizeForPdf = <T extends object>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'string'
        ? toPdfText(value)
        : Array.isArray(value) && value.every((v) => typeof v === 'string')
          ? value.map(toPdfText)
          : value,
    ]),
  ) as T;
