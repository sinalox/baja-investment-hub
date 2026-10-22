// Reduce y recomprime imágenes en el navegador antes de subirlas a Storage.
// Las fotos de celular o PNG pesan 1-5 MB; en WebP a 1920px quedan en
// ~150-300 KB, que es lo que descargan los visitantes desde el móvil.

const MAX_DIMENSION = 1920;
const QUALITY = 0.8;

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

export const compressImage = async (file: File): Promise<File> => {
  // GIF animados y SVG se suben tal cual
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;

  try {
    // imageOrientation respeta la rotación EXIF de las fotos de celular
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    // Safari antiguo no codifica WebP y devuelve PNG: en ese caso usar JPEG
    let blob = await canvasToBlob(canvas, 'image/webp', QUALITY);
    if (!blob || blob.type !== 'image/webp') {
      blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY);
    }
    if (!blob || blob.size >= file.size) return file;

    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
  } catch (error) {
    console.warn('No se pudo comprimir la imagen, se sube la original:', error);
    return file;
  }
};
