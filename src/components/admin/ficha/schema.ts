import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { parseBaths } from '@/lib/properties';

// Modelo del formulario de la ficha técnica (docs/ficha-tecnica-spec.md).
// El formulario trabaja con strings (lo que dan los inputs) y estos mappers
// convierten de/hacia las filas de properties, property_records,
// property_services y property_documents.

type Tables = Database['public']['Tables'];
export type PropertyRow = Tables['properties']['Row'];
export type PropertyInsert = Tables['properties']['Insert'];
export type RecordRow = Tables['property_records']['Row'];
export type RecordUpdate = Tables['property_records']['Update'];
export type ServiceRow = Tables['property_services']['Row'];
export type DocumentRow = Tables['property_documents']['Row'];

// Valores permitidos: coinciden con los CHECK de la migración
export const PROPERTY_TYPES = ['casa', 'oficina', 'lote', 'inversion'] as const;
export const SERVICES = [
  'agua', 'electricidad', 'drenaje', 'alumbrado_publico', 'calle_pavimentada', 'internet', 'gas',
] as const;
export const SERVICE_STATUSES = ['instalado_en_lote', 'en_la_zona', 'no_hay', 'por_confirmar'] as const;
export const DOCUMENT_TYPES = [
  'escritura', 'libertad_gravamen', 'predial', 'identificacion_poderes', 'plano',
  'uso_suelo', 'evidencia_servicios', 'contrato_firmado', 'aprobacion_precio',
] as const;
export const WORKFLOW_STATUSES = [
  'borrador', 'en_validacion', 'listo', 'publicada', 'apartada', 'vendida', 'pausada', 'retirada',
] as const;
export const ACCESS_STATUSES = ['pavimentado', 'terraceria', 'otro', 'por_confirmar'] as const;
export const LOT_TYPES = ['esquina', 'intermedio', 'frente_al_mar', 'vista_al_mar'] as const;
export const TENURE_TYPES = ['privada', 'ejidal', 'comunal', 'fideicomiso', 'otra', 'por_confirmar'] as const;
export const CONTRACT_TYPES = ['exclusiva', 'abierta'] as const;

export type Service = (typeof SERVICES)[number];
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const MAX_DIFFERENTIATORS = 3;
export const MAX_IMAGES = 20;

// ---------------------------------------------------------------------------
// Validaciones de campos (sobre strings de los inputs)
// ---------------------------------------------------------------------------

const text = z.string();

const positiveNumber = z
  .string()
  .refine((v) => v.trim() === '' || (Number.isFinite(Number(v)) && Number(v) > 0), 'Debe ser un número mayor a 0');

const positiveInteger = z
  .string()
  .refine((v) => v.trim() === '' || (Number.isInteger(Number(v)) && Number(v) > 0), 'Debe ser un número entero mayor a 0');

const nonNegativeInteger = z
  .string()
  .refine((v) => v.trim() === '' || (Number.isInteger(Number(v)) && Number(v) >= 0), 'Debe ser un número entero');

// Baños: enteros o medios ("3.5", "3 1/2", "3½")
const halfSteps = z
  .string()
  .refine((v) => !Number.isNaN(parseBaths(v)), 'Usa un número entero o con medio baño, p. ej. 2, 2.5 o 2 1/2');

const url = z
  .string()
  .refine((v) => v.trim() === '' || /^https?:\/\/\S+$/i.test(v.trim()), 'Debe ser un enlace que empiece con https://');

const date = z.string(); // input type="date": '' o yyyy-mm-dd

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal('')]);

// Objeto con una entrada obligatoria por clave (z.record la haría opcional)
const objectOf = <K extends string, T extends z.ZodTypeAny>(keys: readonly K[], schema: T) =>
  z.object(Object.fromEntries(keys.map((key) => [key, schema])) as { [P in K]: T });

// ---------------------------------------------------------------------------
// Esquema del formulario
// ---------------------------------------------------------------------------

export const fichaSchema = z.object({
  property: z.object({
    // A. Identificación
    title: z.string().trim().min(1, 'El nombre comercial es obligatorio').max(150, 'Máximo 150 caracteres'),
    type: z.enum(PROPERTY_TYPES),
    featured: z.boolean(),
    // B. Ubicación
    location: z.string().trim().min(1, 'La zona y municipio son obligatorios'),
    arrival_reference: text,
    distances: text,
    access_status: optionalEnum(ACCESS_STATUSES),
    // C. Superficie
    area_m2: positiveNumber,
    built_area_m2: positiveNumber,
    frontage_m: positiveNumber,
    depth_m: positiveNumber,
    measures_note: text,
    lot_type: z.array(z.enum(LOT_TYPES)),
    topography: text,
    beds: nonNegativeInteger,
    baths: halfSteps,
    // D. Precio
    price: z
      .string()
      .refine((v) => Number.isFinite(Number(v)) && Number(v) > 0, 'El precio es obligatorio y mayor a 0'),
    currency: z.enum(['MXN', 'USD']),
    // G. Posicionamiento
    description: text,
    differentiators: z.array(text).length(MAX_DIFFERENTIATORS),
    cta: text,
    // H. Material
    images: z.array(z.string()).max(MAX_IMAGES, `Máximo ${MAX_IMAGES} fotos`),
    video_url: url,
  }),
  record: z.object({
    // A
    owner_name: text,
    owner_contact: text,
    contract_type: optionalEnum(CONTRACT_TYPES),
    contract_valid_until: date,
    // B
    maps_url: url,
    publish_exact_location: z.boolean(),
    // C
    deed_area_m2: positiveNumber,
    real_area_m2: positiveNumber,
    measures_differ: z.boolean(),
    measures_diff_note: text,
    land_use: text,
    land_use_confirmed: z.boolean(),
    // D
    down_payment: positiveNumber,
    term_months: positiveInteger,
    monthly_payment: positiveNumber,
    interest_and_fees: text,
    financing_confirmed: z.boolean(),
    payment_requirements: text,
    publish_payment_requirements: z.boolean(),
    buyer_costs: text,
    buyer_costs_status: z.enum(['confirmado', 'por_confirmar']),
    publish_buyer_costs: z.boolean(),
    price_valid_until: date,
    price_verified_at: date,
    // F
    tenure_type: optionalEnum(TENURE_TYPES),
    publish_tenure: z.boolean(),
    open_alerts: text,
    docs_reviewed_by: text,
    docs_reviewed_at: date,
    // G
    buyer_profile: text,
    unpublished_notes: text,
    // H
    photos_taken_at: date,
    drive_url: url,
    // I
    last_verified_at: date,
    last_verified_via: text,
    verified_by: text,
    approved_by: text,
    approved_at: date,
  }),
  services: objectOf(SERVICES, z.object({ status: z.enum(SERVICE_STATUSES), evidence_note: text })),
  documents: objectOf(
    DOCUMENT_TYPES,
    z.object({ received: z.boolean(), reviewed: z.boolean(), reviewed_at: date, note: text }),
  ),
}).superRefine((values, ctx) => {
  // Igual que el CHECK installed_requires_evidence de la base
  for (const service of SERVICES) {
    const entry = values.services[service];
    if (entry.status === 'instalado_en_lote' && entry.evidence_note.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['services', service, 'evidence_note'],
        message: 'La evidencia es obligatoria para marcarlo como instalado',
      });
    }
  }
  if (values.record.financing_confirmed && !values.record.down_payment && !values.record.monthly_payment) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['record', 'financing_confirmed'],
      message: 'Para publicar el financiamiento captura al menos el enganche o la mensualidad',
    });
  }
});

export type FichaValues = z.infer<typeof fichaSchema>;

// ---------------------------------------------------------------------------
// Base de datos -> formulario
// ---------------------------------------------------------------------------

const s = (v: string | number | null | undefined) => (v == null ? '' : String(v));

const emptyServices = () =>
  Object.fromEntries(
    SERVICES.map((service) => [service, { status: 'por_confirmar' as const, evidence_note: '' }]),
  ) as FichaValues['services'];

const emptyDocuments = () =>
  Object.fromEntries(
    DOCUMENT_TYPES.map((doc) => [doc, { received: false, reviewed: false, reviewed_at: '', note: '' }]),
  ) as FichaValues['documents'];

const padDifferentiators = (items: string[]) =>
  [...items, '', '', ''].slice(0, MAX_DIFFERENTIATORS);

export const toFormValues = (
  property?: PropertyRow | null,
  record?: RecordRow | null,
  services: ServiceRow[] = [],
  documents: DocumentRow[] = [],
): FichaValues => {
  const p = property;
  const r = record;
  const servicesValues = emptyServices();
  for (const row of services) {
    if (row.service in servicesValues) {
      servicesValues[row.service as Service] = {
        status: row.status as FichaValues['services'][Service]['status'],
        evidence_note: s(row.evidence_note),
      };
    }
  }
  const documentsValues = emptyDocuments();
  for (const row of documents) {
    if (row.doc_type in documentsValues) {
      documentsValues[row.doc_type as DocumentType] = {
        received: row.received,
        reviewed: row.reviewed,
        reviewed_at: s(row.reviewed_at),
        note: s(row.note),
      };
    }
  }

  return {
    property: {
      title: s(p?.title),
      type: (p?.type as FichaValues['property']['type']) ?? 'casa',
      featured: p?.featured ?? false,
      location: s(p?.location),
      arrival_reference: s(p?.arrival_reference),
      distances: s(p?.distances),
      access_status: (p?.access_status as FichaValues['property']['access_status']) ?? '',
      area_m2: s(p?.area_m2),
      built_area_m2: s(p?.built_area_m2),
      frontage_m: s(p?.frontage_m),
      depth_m: s(p?.depth_m),
      measures_note: s(p?.measures_note),
      lot_type: (p?.lot_type ?? []) as FichaValues['property']['lot_type'],
      topography: s(p?.topography),
      beds: s(p?.beds),
      baths: s(p?.baths),
      price: s(p?.price),
      currency: p?.currency === 'USD' ? 'USD' : 'MXN',
      description: s(p?.description),
      differentiators: padDifferentiators(p?.differentiators ?? []),
      cta: s(p?.cta),
      images: p?.images?.length ? p.images : p?.image_url ? [p.image_url] : [],
      video_url: s(p?.video_url),
    },
    record: {
      owner_name: s(r?.owner_name),
      owner_contact: s(r?.owner_contact),
      contract_type: (r?.contract_type as FichaValues['record']['contract_type']) ?? '',
      contract_valid_until: s(r?.contract_valid_until),
      maps_url: s(r?.maps_url),
      publish_exact_location: r?.publish_exact_location ?? false,
      deed_area_m2: s(r?.deed_area_m2),
      real_area_m2: s(r?.real_area_m2),
      measures_differ: r?.measures_differ ?? false,
      measures_diff_note: s(r?.measures_diff_note),
      land_use: s(r?.land_use),
      land_use_confirmed: r?.land_use_confirmed ?? false,
      down_payment: s(r?.down_payment),
      term_months: s(r?.term_months),
      monthly_payment: s(r?.monthly_payment),
      interest_and_fees: s(r?.interest_and_fees),
      financing_confirmed: r?.financing_confirmed ?? false,
      payment_requirements: s(r?.payment_requirements),
      publish_payment_requirements: r?.publish_payment_requirements ?? false,
      buyer_costs: s(r?.buyer_costs),
      buyer_costs_status: r?.buyer_costs_status === 'confirmado' ? 'confirmado' : 'por_confirmar',
      publish_buyer_costs: r?.publish_buyer_costs ?? false,
      price_valid_until: s(r?.price_valid_until),
      price_verified_at: s(r?.price_verified_at),
      tenure_type: (r?.tenure_type as FichaValues['record']['tenure_type']) ?? '',
      publish_tenure: r?.publish_tenure ?? false,
      open_alerts: s(r?.open_alerts),
      docs_reviewed_by: s(r?.docs_reviewed_by),
      docs_reviewed_at: s(r?.docs_reviewed_at),
      buyer_profile: s(r?.buyer_profile),
      unpublished_notes: s(r?.unpublished_notes),
      photos_taken_at: s(r?.photos_taken_at),
      drive_url: s(r?.drive_url),
      last_verified_at: s(r?.last_verified_at),
      last_verified_via: s(r?.last_verified_via),
      verified_by: s(r?.verified_by),
      approved_by: s(r?.approved_by),
      approved_at: s(r?.approved_at),
    },
    services: servicesValues,
    documents: documentsValues,
  };
};

// ---------------------------------------------------------------------------
// Formulario -> base de datos
// ---------------------------------------------------------------------------

const textOrNull = (v: string) => (v.trim() === '' ? null : v.trim());
const numberOrNull = (v: string) => (v.trim() === '' ? null : Number(v));
const dateOrNull = (v: string) => (v === '' ? null : v);

// Sin status: lo calcula la base desde workflow_status. Sin code: lo asigna
// un trigger y no se puede editar.
export const toPropertyPayload = (values: FichaValues, previousArea = ''): PropertyInsert => {
  const p = values.property;
  const areaM2 = numberOrNull(p.area_m2);
  return {
    title: p.title.trim(),
    type: p.type,
    category: p.type,
    featured: p.featured,
    location: p.location.trim(),
    arrival_reference: textOrNull(p.arrival_reference),
    distances: textOrNull(p.distances),
    access_status: p.access_status || null,
    area_m2: areaM2,
    built_area_m2: numberOrNull(p.built_area_m2),
    // `area` (texto) se conserva por compatibilidad: se deriva de los m²
    area: areaM2 != null ? `${areaM2} m²` : previousArea,
    frontage_m: numberOrNull(p.frontage_m),
    depth_m: numberOrNull(p.depth_m),
    measures_note: textOrNull(p.measures_note),
    lot_type: p.lot_type,
    topography: textOrNull(p.topography),
    beds: numberOrNull(p.beds),
    baths: parseBaths(p.baths),
    price: Number(p.price),
    currency: p.currency,
    description: textOrNull(p.description),
    differentiators: p.differentiators.map((d) => d.trim()).filter(Boolean).slice(0, MAX_DIFFERENTIATORS),
    cta: textOrNull(p.cta),
    images: p.images,
    image_url: p.images[0] ?? null,
    video_url: textOrNull(p.video_url),
  };
};

// Sin workflow_status: solo cambia desde el panel de publicación
export const toRecordPayload = (values: FichaValues): RecordUpdate => {
  const r = values.record;
  return {
    owner_name: textOrNull(r.owner_name),
    owner_contact: textOrNull(r.owner_contact),
    contract_type: r.contract_type || null,
    contract_valid_until: dateOrNull(r.contract_valid_until),
    maps_url: textOrNull(r.maps_url),
    publish_exact_location: r.publish_exact_location,
    deed_area_m2: numberOrNull(r.deed_area_m2),
    real_area_m2: numberOrNull(r.real_area_m2),
    measures_differ: r.measures_differ,
    measures_diff_note: textOrNull(r.measures_diff_note),
    land_use: textOrNull(r.land_use),
    land_use_confirmed: r.land_use_confirmed,
    down_payment: numberOrNull(r.down_payment),
    term_months: numberOrNull(r.term_months),
    monthly_payment: numberOrNull(r.monthly_payment),
    interest_and_fees: textOrNull(r.interest_and_fees),
    financing_confirmed: r.financing_confirmed,
    payment_requirements: textOrNull(r.payment_requirements),
    publish_payment_requirements: r.publish_payment_requirements,
    buyer_costs: textOrNull(r.buyer_costs),
    buyer_costs_status: r.buyer_costs_status,
    publish_buyer_costs: r.publish_buyer_costs,
    price_valid_until: dateOrNull(r.price_valid_until),
    price_verified_at: dateOrNull(r.price_verified_at),
    tenure_type: r.tenure_type || null,
    publish_tenure: r.publish_tenure,
    open_alerts: textOrNull(r.open_alerts),
    docs_reviewed_by: textOrNull(r.docs_reviewed_by),
    docs_reviewed_at: dateOrNull(r.docs_reviewed_at),
    buyer_profile: textOrNull(r.buyer_profile),
    unpublished_notes: textOrNull(r.unpublished_notes),
    photos_taken_at: dateOrNull(r.photos_taken_at),
    drive_url: textOrNull(r.drive_url),
    last_verified_at: dateOrNull(r.last_verified_at),
    last_verified_via: textOrNull(r.last_verified_via),
    verified_by: textOrNull(r.verified_by),
    approved_by: textOrNull(r.approved_by),
    approved_at: dateOrNull(r.approved_at),
  };
};

export const toServiceRows = (propertyId: string, values: FichaValues): ServiceRow[] =>
  SERVICES.map((service) => ({
    property_id: propertyId,
    service,
    status: values.services[service].status,
    evidence_note: textOrNull(values.services[service].evidence_note),
  }));

export const toDocumentRows = (propertyId: string, values: FichaValues): DocumentRow[] =>
  DOCUMENT_TYPES.map((doc_type) => ({
    property_id: propertyId,
    doc_type,
    received: values.documents[doc_type].received,
    reviewed: values.documents[doc_type].reviewed,
    reviewed_at: dateOrNull(values.documents[doc_type].reviewed_at),
    note: textOrNull(values.documents[doc_type].note),
  }));

// Verificación vencida: se marca en el admin, pero no despublica (decisión 9)
export const isVerificationExpired = (lastVerifiedAt: string | null | undefined, maxDays: number, today = new Date()) => {
  if (!lastVerifiedAt) return true;
  const last = new Date(`${lastVerifiedAt}T00:00:00`);
  const limit = new Date(today);
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() - maxDays);
  return last < limit;
};
