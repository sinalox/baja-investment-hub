// @react-pdf/renderer solo acepta JPEG y PNG, y las fotos se guardan en WebP.
// Se convierten en el navegador con canvas y se reducen para que el PDF sea
// ligero (se manda por WhatsApp).

const loadBitmap = async (url: string) => {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`No se pudo descargar la imagen (${res.status})`);
  return createImageBitmap(await res.blob());
};

const drawToCanvas = (bitmap: ImageBitmap, maxSize: number) => {
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas no disponible');
  return { canvas, ctx };
};

export interface PdfImage {
  src: string; // data URL
  width: number;
  height: number;
}

export const toJpeg = async (url: string, maxSize = 1400, quality = 0.8): Promise<PdfImage> => {
  const bitmap = await loadBitmap(url);
  const { canvas, ctx } = drawToCanvas(bitmap, maxSize);
  // Fondo blanco: JPEG no tiene transparencia
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { src: canvas.toDataURL('image/jpeg', quality), width: canvas.width, height: canvas.height };
};

// Para el logo (necesita transparencia)
export const toPng = async (url: string, maxSize = 600): Promise<PdfImage> => {
  const bitmap = await loadBitmap(url);
  const { canvas, ctx } = drawToCanvas(bitmap, maxSize);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { src: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
};

// Convierte varias imágenes sin que una foto rota impida generar el PDF
export const toJpegs = async (urls: string[], maxSize?: number) => {
  const results = await Promise.allSettled(urls.map((url) => toJpeg(url, maxSize)));
  return results
    .filter((r): r is PromiseFulfilledResult<PdfImage> => r.status === 'fulfilled')
    .map((r) => r.value);
};
