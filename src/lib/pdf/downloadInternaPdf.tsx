import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';
import { getPropertyImages } from '@/lib/properties';
import FichaInternaPdf from './FichaInternaPdf';
import { fileName } from './theme';
import { downloadBlob, todayLabel } from './download';
import { toJpeg, toPng } from './images';

// Ficha interna (P + I). Solo admin: lee las tablas internas con la sesión
// del administrador (RLS).
export const downloadInternaPdf = async (id: string) => {
  const [property, record, services, documents] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('property_records').select('*').eq('property_id', id).single(),
    supabase.from('property_services').select('*').eq('property_id', id),
    supabase.from('property_documents').select('*').eq('property_id', id),
  ]);
  const error = property.error ?? record.error ?? services.error ?? documents.error;
  if (error) throw error;

  const [first] = getPropertyImages(property.data);
  const [cover, logo] = await Promise.all([
    first ? toJpeg(first, 600).catch(() => null) : null,
    toPng('/1.webp').catch(() => null),
  ]);

  const blob = await pdf(
    <FichaInternaPdf
      property={property.data}
      record={record.data}
      services={services.data ?? []}
      documents={documents.data ?? []}
      cover={cover}
      logo={logo}
      generatedAt={todayLabel()}
    />,
  ).toBlob();
  downloadBlob(blob, fileName(property.data.code, property.data.title, '-INTERNA'));
};
