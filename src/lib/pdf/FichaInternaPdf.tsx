import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import type { Database } from '@/integrations/supabase/types';
import {
  ACCESS_STATUS_LABELS,
  DOCUMENT_LABELS,
  LOT_TYPE_LABELS,
  SERVICE_LABELS,
  SERVICE_STATUS_LABELS,
  TENURE_LABELS,
  WORKFLOW_STATUS_LABELS,
  formatArea,
  formatDate,
  formatMeasures,
  formatPrice,
  getTypeLabel,
} from '@/lib/properties';
import { PdfFooter, PdfHeader, Row, Section } from './common';
import { colors, styles } from './theme';
import type { PdfImage } from './images';

type Tables = Database['public']['Tables'];

interface Props {
  property: Tables['properties']['Row'];
  record: Tables['property_records']['Row'];
  services: Tables['property_services']['Row'][];
  documents: Tables['property_documents']['Row'][];
  cover?: PdfImage | null;
  logo?: PdfImage | null;
  generatedAt: string;
}

// P* con su estado de publicación, para saber qué ve el cliente
const published = (value: string | null | undefined, isPublished: boolean) =>
  value && value.trim() !== '' ? `${value}  [${isPublished ? 'PUBLICADO' : 'no publicado'}]` : null;

const yesNo = (v: boolean | null | undefined) => (v ? 'Sí' : 'No');

const FichaInternaPdf = ({ property: p, record: r, services, documents, cover, logo, generatedAt }: Props) => {
  const money = (v: number | null) => (v != null ? formatPrice(v, p.currency) : null);
  const docsByType = Object.fromEntries(documents.map((d) => [d.doc_type, d]));
  const servicesByName = Object.fromEntries(services.map((s) => [s.service, s]));
  const note = `USO INTERNO · No compartir · ${p.code} · Versión ${r.ficha_version} · Generada el ${generatedAt}`;

  return (
    <Document title={`Ficha interna ${p.code} - ${p.title}`} author="Heredia Land Baja" language="es-MX">
      <Page size="A4" style={styles.page}>
        <PdfHeader logo={logo} label="FICHA INTERNA · USO INTERNO" />
        <PdfFooter note={note} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{getTypeLabel(p.type)} · {p.code}</Text>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.subtitle}>{p.location}</Text>
            <Text style={{ marginTop: 8, fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{formatPrice(Number(p.price), p.currency)}</Text>
            <Text style={{ marginTop: 6 }}>
              Estado: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{WORKFLOW_STATUS_LABELS[r.workflow_status] ?? r.workflow_status}</Text>
              {'   '}Versión de ficha: {r.ficha_version}
            </Text>
          </View>
          {cover && (
            <View style={{ width: 170, height: 120, backgroundColor: colors.soft, borderRadius: 4, overflow: 'hidden' }}>
              <Image src={cover.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </View>
          )}
        </View>

        <Section title="A. Identificación">
          <Row label="Referencia" value={p.code} />
          <Row label="Propietario / desarrollador" value={r.owner_name} />
          <Row label="Contacto del propietario" value={r.owner_contact} />
          <Row label="Contrato" value={r.contract_type ? `${r.contract_type === 'exclusiva' ? 'Exclusiva' : 'Abierta'}, vigente hasta ${formatDate(r.contract_valid_until) || 'sin fecha'}` : null} />
        </Section>

        <Section title="B. Ubicación">
          <Row label="Zona y municipio" value={p.location} />
          <Row label="Referencia de llegada" value={p.arrival_reference} />
          <Row label="Distancias" value={p.distances} />
          <Row label="Acceso" value={p.access_status ? ACCESS_STATUS_LABELS[p.access_status] : null} />
          <Row label="Google Maps (pin exacto)" value={published(r.maps_url, r.publish_exact_location)} />
        </Section>

        <Section title="C. Superficie y características">
          <Row label="Superficie" value={formatArea(p)} />
          <Row label="Frente × fondo" value={formatMeasures(p.frontage_m, p.depth_m)} />
          <Row label="Nota de medidas" value={p.measures_note} />
          <Row label="Escritura vs. real" value={r.measures_differ
            ? `Difieren: escritura ${r.deed_area_m2 ?? '?'} m², real ${r.real_area_m2 ?? '?'} m². ${r.measures_diff_note ?? ''}`
            : 'No difieren'} />
          <Row label="Tipo de lote" value={p.lot_type.map((t) => LOT_TYPE_LABELS[t] ?? t).join(' · ')} />
          <Row label="Topografía" value={p.topography} />
          <Row label="Uso de suelo" value={published(r.land_use, r.land_use_confirmed)} />
          <Row label="Recámaras / baños" value={`${p.beds ?? 0} / ${p.baths ?? 0}`} />
        </Section>

        <Section title="D. Precio y condiciones">
          <Row label="Precio de contado" value={formatPrice(Number(p.price), p.currency)} />
          <Row label="Precio verificado el" value={formatDate(r.price_verified_at)} />
          <Row label="Vigencia del precio" value={formatDate(r.price_valid_until)} />
          <Row label="Financiamiento" value={published(
            [money(r.down_payment) && `Enganche ${money(r.down_payment)}`, r.term_months && `${r.term_months} meses`,
              money(r.monthly_payment) && `Mensualidad ${money(r.monthly_payment)}`, r.interest_and_fees]
              .filter(Boolean).join(' · '),
            r.financing_confirmed,
          )} />
          <Row label="Requisitos del plan" value={published(r.payment_requirements, r.publish_payment_requirements)} />
          <Row label="Gastos del comprador" value={published(
            r.buyer_costs_status === 'por_confirmar' ? 'Por confirmar' : r.buyer_costs, r.publish_buyer_costs,
          )} />
        </Section>

        <Section title="E. Servicios">
          {Object.keys(SERVICE_LABELS).map((service) => {
            const s = servicesByName[service];
            const status = SERVICE_STATUS_LABELS[s?.status ?? 'por_confirmar'];
            return <Row key={service} label={SERVICE_LABELS[service]} value={`${status}${s?.evidence_note ? ` · Evidencia: ${s.evidence_note}` : ''}`} />;
          })}
        </Section>

        <Section title="F. Situación documental">
          <Row label="Tenencia" value={published(r.tenure_type ? TENURE_LABELS[r.tenure_type] : null, r.publish_tenure)} />
          {Object.keys(DOCUMENT_LABELS).map((doc) => {
            const d = docsByType[doc];
            const status = d
              ? `Recibido: ${yesNo(d.received)} · Revisado: ${yesNo(d.reviewed)}${d.reviewed_at ? ` (${formatDate(d.reviewed_at)})` : ''}${d.note ? ` · ${d.note}` : ''}`
              : 'Sin registrar';
            return <Row key={doc} label={DOCUMENT_LABELS[doc]} value={status} />;
          })}
          <Row label="Revisado por" value={r.docs_reviewed_by ? `${r.docs_reviewed_by} el ${formatDate(r.docs_reviewed_at)}` : null} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Alertas abiertas</Text>
            <Text style={[styles.rowValue, r.open_alerts ? { color: colors.red, fontFamily: 'Helvetica-Bold' } : {}]}>
              {r.open_alerts || 'Ninguna'}
            </Text>
          </View>
        </Section>

        <Section title="G. Posicionamiento comercial">
          <Row label="Diferenciadores" value={p.differentiators.join(' · ')} />
          <Row label="Llamada a la acción" value={p.cta} />
          <Row label="Perfil de comprador" value={r.buyer_profile} />
          <Row label="Datos que NO se publican" value={r.unpublished_notes} />
        </Section>

        <Section title="H. Material">
          <Row label="Fotos" value={`${p.images.length}`} />
          <Row label="Video" value={p.video_url} />
          <Row label="Fecha de las tomas" value={formatDate(r.photos_taken_at)} />
          <Row label="Carpeta de Drive" value={r.drive_url} />
        </Section>

        <Section title="I. Verificación">
          <Row label="Última verificación" value={r.last_verified_at
            ? `${formatDate(r.last_verified_at)}${r.last_verified_via ? ` (${r.last_verified_via})` : ''}` : null} />
          <Row label="Verificado por" value={r.verified_by} />
          <Row label="Aprobado para publicar" value={r.approved_by ? `${r.approved_by} el ${formatDate(r.approved_at)}` : null} />
        </Section>
      </Page>
    </Document>
  );
};

export default FichaInternaPdf;
