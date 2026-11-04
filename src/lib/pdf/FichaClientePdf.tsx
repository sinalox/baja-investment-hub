import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import type { PublicProperty } from '@/lib/publicApi';
import {
  ACCESS_STATUS_LABELS,
  LOT_TYPE_LABELS,
  PUBLIC_STATUS_LABELS,
  SERVICE_LABELS,
  SERVICE_STATUS_LABELS,
  TENURE_LABELS,
  formatArea,
  formatDate,
  formatMeasures,
  formatPrice,
  getTypeLabel,
} from '@/lib/properties';
import { PdfFooter, PdfHeader, Section } from './common';
import { colors, filledRows, styles } from './theme';
import type { PdfImage } from './images';

// Ficha para el cliente. SOLO recibe datos de la vista public_properties
// (P y P* activados): así ningún campo interno puede terminar en el PDF.

interface Props {
  property: PublicProperty;
  cover?: PdfImage | null;
  photos: PdfImage[]; // hasta 4
  logo?: PdfImage | null;
  qr: string; // data URL
  url: string;
}

const KeyFact = ({ value, label }: { value: string; label: string }) => (
  <View style={{ flex: 1, padding: 8, backgroundColor: colors.soft, borderRadius: 4 }}>
    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12 }}>{value}</Text>
    <Text style={styles.small}>{label}</Text>
  </View>
);

const Rows = ({ rows }: { rows: [string, string][] }) => (
  <>
    {rows.map(([label, value]) => (
      <View key={label} style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    ))}
  </>
);

const FichaClientePdf = ({ property: p, cover, photos, logo, qr, url }: Props) => {
  const price = formatPrice(Number(p.price), p.currency);
  const updated = formatDate(p.price_updated_at);
  const status = PUBLIC_STATUS_LABELS[p.status];
  const money = (v: number | null) => (v != null ? formatPrice(v, p.currency) : null);

  const facts = [
    formatArea(p) && { value: formatArea(p), label: 'Superficie' },
    formatMeasures(p.frontage_m, p.depth_m) && { value: formatMeasures(p.frontage_m, p.depth_m), label: 'Frente × fondo' },
    (p.beds ?? 0) > 0 && { value: String(p.beds), label: 'Recámaras' },
    (p.baths ?? 0) > 0 && { value: String(p.baths), label: 'Baños' },
  ].filter(Boolean) as { value: string; label: string }[];

  const location = filledRows([
    ['Zona', p.location],
    ['Cómo llegar', p.arrival_reference],
    ['Distancias', p.distances],
    ['Acceso', p.access_status ? ACCESS_STATUS_LABELS[p.access_status] : null],
    ['Ubicación exacta', p.maps_url],
  ]);
  const land = filledRows([
    ['Tipo de lote', p.lot_type.map((t) => LOT_TYPE_LABELS[t] ?? t).join(' · ')],
    ['Topografía', p.topography],
    ['Medidas', p.measures_note],
    ['Uso de suelo', p.land_use],
    ['Tenencia', p.tenure_type ? TENURE_LABELS[p.tenure_type] : null],
  ]);
  // Mismo orden que la web y el formulario
  const services = Object.keys(SERVICE_LABELS)
    .filter((s) => s in ((p.services ?? {}) as Record<string, string>))
    .map((s) => [s, (p.services as Record<string, string>)[s]] as const)
    .map(([s, st]) => [SERVICE_LABELS[s], SERVICE_STATUS_LABELS[st] ?? st] as [string, string]);
  const conditions = filledRows([
    ['Precio de contado', price],
    ['Enganche', money(p.down_payment)],
    ['Plazo', p.term_months ? `${p.term_months} meses` : null],
    ['Mensualidad', money(p.monthly_payment)],
    ['Intereses y cargos', p.interest_and_fees],
    ['Requisitos', p.payment_requirements],
    ['Gastos del comprador', p.buyer_costs_status === 'por_confirmar' ? 'Por confirmar' : p.buyer_costs],
  ]);

  const legal = `Información sujeta a cambios sin previo aviso.${updated ? ` Precio actualizado el ${updated}.` : ''} Ref. ${p.code}`;

  return (
    <Document title={`Ficha ${p.code} - ${p.title}`} author="Heredia Land Baja" language="es-MX">
      <Page size="A4" style={styles.page}>
        <PdfHeader logo={logo} />
        <PdfFooter note={legal} />

        <Text style={styles.eyebrow}>{getTypeLabel(p.type)}</Text>
        <Text style={styles.title}>{p.title}</Text>
        <Text style={styles.subtitle}>{p.location}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
          <View>
            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold' }}>{price}</Text>
            <Text style={styles.small}>Ref. {p.code}{updated ? ` · Precio actualizado el ${updated}` : ''}</Text>
          </View>
          {status && (
            <Text style={{
              color: '#fff', backgroundColor: p.status === 'sold' ? colors.red : colors.amber,
              paddingVertical: 4, paddingHorizontal: 8, fontFamily: 'Helvetica-Bold', fontSize: 9,
            }}>
              {status.toUpperCase()}
            </Text>
          )}
        </View>

        {cover && (
          <View style={{ marginTop: 12, height: 300, backgroundColor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
            <Image src={cover.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </View>
        )}

        {facts.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {facts.map((f) => <KeyFact key={f.label} {...f} />)}
          </View>
        )}

        {p.differentiators.length > 0 && (
          <View style={{ marginTop: 12 }}>
            {p.differentiators.map((d) => (
              <Text key={d} style={{ marginBottom: 3 }}>
                <Text style={{ color: colors.gold, fontFamily: 'Helvetica-Bold' }}>•  </Text>{d}
              </Text>
            ))}
          </View>
        )}

        {/* QR + CTA al final de la primera página */}
        <View style={{
          marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10,
          borderWidth: 1, borderColor: colors.border, borderRadius: 4,
        }}>
          <Image src={qr} style={{ width: 72, height: 72 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11 }}>{p.cta || 'Agenda una visita'}</Text>
            <Text style={{ marginTop: 3, color: colors.muted }}>Escanea el código para ver fotos y detalles en línea.</Text>
            <Text style={{ marginTop: 3, fontSize: 8, color: colors.gold }}>{url}</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <PdfHeader logo={logo} />
        <PdfFooter note={legal} />

        {photos.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
            {photos.map((photo, i) => (
              <View key={i} style={{ width: '48.5%', height: 125, backgroundColor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
                <Image src={photo.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </View>
            ))}
          </View>
        )}

        {p.description && (
          <Section title="Descripción">
            <Text style={{ lineHeight: 1.5 }}>{p.description}</Text>
          </Section>
        )}
        {location.length > 0 && <Section title="Ubicación"><Rows rows={location} /></Section>}
        {land.length > 0 && <Section title="Características"><Rows rows={land} /></Section>}
        {services.length > 0 && <Section title="Servicios"><Rows rows={services} /></Section>}
        {conditions.length > 0 && <Section title="Precio y condiciones"><Rows rows={conditions} /></Section>}
      </Page>
    </Document>
  );
};

export default FichaClientePdf;
