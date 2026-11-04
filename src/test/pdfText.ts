import { inflateSync } from 'node:zlib';

// Extrae el texto de un PDF generado por @react-pdf/renderer (solo para
// tests). Descomprime los streams y reconstruye las cadenas de los operadores
// de texto Tj/TJ (hex <...> o literales (...)), uniendo los fragmentos que el
// kerning separa.
export const extractPdfText = (pdf: Buffer): string => {
  const raw = pdf.toString('latin1');
  const lines: string[] = [];
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  for (const match of raw.matchAll(streamRe)) {
    let content: string;
    try {
      content = inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
    } catch {
      continue; // imágenes y streams no comprimidos con Flate
    }
    for (const op of content.matchAll(/\[(.*?)\]\s*TJ|(<[0-9a-fA-F]*>|\((?:\\.|[^\\)])*\))\s*Tj/g)) {
      const body = op[1] ?? op[2];
      const parts = [...body.matchAll(/<([0-9a-fA-F]*)>|\(((?:\\.|[^\\)])*)\)/g)].map((p) =>
        p[1] !== undefined
          ? Buffer.from(p[1], 'hex').toString('latin1')
          : p[2].replace(/\\([()\\])/g, '$1'),
      );
      lines.push(parts.join(''));
    }
  }
  return lines.join('\n');
};
