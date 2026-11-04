import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { fetchProperty, type PublicProperty } from '@/lib/publicApi';
import { getPropertyImages } from '@/lib/properties';
import FichaClientePdf from './FichaClientePdf';
import { fileName } from './theme';
import { downloadBlob } from './download';
import { toJpeg, toJpegs, toPng } from './images';

// Se importa con import() solo al pulsar "Descargar ficha": la librería de
// PDF no entra en el bundle de la landing.

const CLIENT_PHOTOS = 4;

export const propertyUrl = (id: string) => `${window.location.origin}/properties/${id}`;

export const downloadClientePdf = async (property: PublicProperty) => {
  const url = propertyUrl(property.id);
  const [cover, photos, logo, qr] = await Promise.all([
    (async () => {
      const [first] = getPropertyImages(property);
      return first ? toJpeg(first, 1400).catch(() => null) : null;
    })(),
    toJpegs(getPropertyImages(property).slice(1, 1 + CLIENT_PHOTOS), 900),
    toPng('/1.webp').catch(() => null),
    QRCode.toDataURL(url, { margin: 1, width: 300, color: { dark: '#141414', light: '#ffffff' } }),
  ]);

  const blob = await pdf(
    <FichaClientePdf property={property} cover={cover} photos={photos} logo={logo} qr={qr} url={url} />,
  ).toBlob();
  downloadBlob(blob, fileName(property.code, property.title));
};

// Desde el admin: la ficha cliente sale de la vista pública (misma fuente que
// la web), así que solo existe para propiedades visibles
export const downloadClientePdfById = async (id: string) => {
  const property = await fetchProperty(id);
  if (!property) {
    throw new Error('La ficha cliente solo está disponible para propiedades visibles en la web (publicada, apartada o vendida).');
  }
  await downloadClientePdf(property);
};
