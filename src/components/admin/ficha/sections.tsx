import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ACCESS_STATUS_LABELS,
  DOCUMENT_LABELS,
  LOT_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  SERVICE_LABELS,
  SERVICE_STATUS_LABELS,
  TENURE_LABELS,
} from '@/lib/properties';
import {
  CheckboxGroupField,
  FieldGroup,
  PublishSwitch,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
  VisibilityBadge,
} from './fields';
import GalleryEditor from './GalleryEditor';
import { DOCUMENT_TYPES, MAX_DIFFERENTIATORS, SERVICES, type FichaValues } from './schema';

const CONTRACT_LABELS = { exclusiva: 'Exclusiva', abierta: 'Abierta' };
const BUYER_COSTS_STATUS_LABELS = { confirmado: 'Confirmado', por_confirmar: 'Por confirmar' };

// A. Identificación
export const SectionIdentificacion = ({ code }: { code?: string }) => (
  <div className="space-y-8">
    <FieldGroup>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label>Referencia (folio)</Label>
          <VisibilityBadge visibility="P" />
        </div>
        <p className="h-10 flex items-center rounded-md border bg-muted px-3 text-sm font-mono">
          {code ?? 'Se asigna al guardar (LB-C### / LB-O### / LB-T### / LB-I###)'}
        </p>
      </div>
      <TextField name="property.title" label="Nombre comercial" visibility="P" required />
      <SelectField name="property.type" label="Tipo" visibility="P" options={PROPERTY_TYPE_LABELS} required
        hint="El folio se asigna según el tipo al crear la propiedad y no cambia después" />
      <div className="flex items-end pb-2">
        <SwitchField name="property.featured" label="Propiedad destacada" hint="Aparece primero en el catálogo" />
      </div>
    </FieldGroup>

    <FieldGroup title="Propietario y contrato" description="Nunca se publica.">
      <TextField name="record.owner_name" label="Propietario / desarrollador" visibility="I" />
      <TextField name="record.owner_contact" label="Contacto del propietario" visibility="I" />
      <SelectField name="record.contract_type" label="Tipo de contrato" visibility="I" options={CONTRACT_LABELS} allowEmpty />
      <TextField name="record.contract_valid_until" label="Vigencia del contrato" visibility="I" type="date" />
    </FieldGroup>
  </div>
);

// B. Ubicación
export const SectionUbicacion = () => (
  <div className="space-y-8">
    <FieldGroup>
      <TextField name="property.location" label="Zona y municipio" visibility="P" required
        placeholder="Ej. Playas de Rosarito, Rosarito"
        hint="Solo zona y municipio. La dirección exacta va en el enlace de Google Maps." />
      <SelectField name="property.access_status" label="Estado del acceso" visibility="P" options={ACCESS_STATUS_LABELS} allowEmpty />
      <TextAreaField name="property.arrival_reference" label="Referencia de llegada" visibility="P"
        placeholder="Ej. A 5 min de la caseta de Rosarito, sobre la carretera libre" />
      <TextAreaField name="property.distances" label="Distancias o tiempos a puntos clave" visibility="P"
        placeholder="Ej. 10 min a la playa · 25 min a la garita de San Ysidro" />
    </FieldGroup>

    <FieldGroup title="Ubicación exacta">
      <TextField name="record.maps_url" label="Enlace de Google Maps (pin exacto)" visibility="P*" type="url"
        placeholder="https://maps.app.goo.gl/…" />
      <div className="flex items-end">
        <PublishSwitch name="record.publish_exact_location" label="Publicar ubicación exacta" />
      </div>
    </FieldGroup>
  </div>
);

// C. Superficie y características
export const SectionSuperficie = () => {
  const measuresDiffer = useWatch<FichaValues, 'record.measures_differ'>({ name: 'record.measures_differ' });
  return (
    <div className="space-y-8">
      <FieldGroup>
        <TextField name="property.area_m2" label="Terreno (m²)" visibility="P" type="number" />
        <TextField name="property.built_area_m2" label="Construcción (m²)" visibility="P" type="number"
          hint="Opcional. Déjalo vacío en lotes sin construcción." />
        <TextField name="property.topography" label="Topografía" visibility="P" placeholder="Ej. Plano, pendiente suave" />
        <TextField name="property.frontage_m" label="Frente (m)" visibility="P" type="number" />
        <TextField name="property.depth_m" label="Fondo (m)" visibility="P" type="number" />
        <TextField name="property.measures_note" label="Nota de medidas" visibility="P"
          hint="Se publica. Úsala para lotes irregulares." />
        <CheckboxGroupField name="property.lot_type" label="Tipo de lote" visibility="P" options={LOT_TYPE_LABELS} />
        <TextField name="property.beds" label="Recámaras" visibility="P" type="number" inputMode="numeric" />
        <TextField name="property.baths" label="Baños" visibility="P" inputMode="decimal" placeholder="Ej. 2, 2.5 o 2 1/2"
          hint="Acepta medios baños: 2.5, 2 1/2 o 2½" />
      </FieldGroup>

      <FieldGroup title="Medida de escritura vs. medida real" description="Interno: no se publica.">
        <div className="sm:col-span-2">
          <SwitchField name="record.measures_differ" label="La medida de escritura y la real difieren" />
        </div>
        {measuresDiffer && (
          <>
            <TextField name="record.deed_area_m2" label="Medida de escritura (m²)" visibility="I" type="number" />
            <TextField name="record.real_area_m2" label="Medida real (m²)" visibility="I" type="number" />
            <TextAreaField name="record.measures_diff_note" label="Detalle de la diferencia" visibility="I" className="sm:col-span-2" />
          </>
        )}
      </FieldGroup>

      <FieldGroup title="Uso de suelo">
        <TextField name="record.land_use" label="Uso de suelo" visibility="P*" placeholder="Ej. Habitacional H2" />
        <div className="flex items-end">
          <PublishSwitch name="record.land_use_confirmed" label="Confirmado: publicar" />
        </div>
      </FieldGroup>
    </div>
  );
};

// D. Precio y condiciones
export const SectionPrecio = () => {
  const currency = useWatch<FichaValues, 'property.currency'>({ name: 'property.currency' });
  return (
    <div className="space-y-8">
      <FieldGroup>
        <TextField name="property.price" label="Precio de contado" visibility="P" type="number" required />
        <SelectField name="property.currency" label="Moneda" visibility="P" options={['MXN', 'USD']} required />
        <TextField name="record.price_verified_at" label="Fecha de verificación del precio" visibility="I" type="date"
          hint='La web muestra "Precio actualizado el …" con esta fecha' />
        <TextField name="record.price_valid_until" label="Vigencia del precio" visibility="I" type="date" />
      </FieldGroup>

      <FieldGroup title="Financiamiento" description={`Montos en ${currency}, la moneda del precio.`}>
        <TextField name="record.down_payment" label={`Enganche (${currency})`} visibility="P*" type="number" />
        <TextField name="record.term_months" label="Plazo (meses)" visibility="P*" type="number" inputMode="numeric" />
        <TextField name="record.monthly_payment" label={`Mensualidad (${currency})`} visibility="P*" type="number" />
        <TextField name="record.interest_and_fees" label="Intereses y cargos" visibility="P*" placeholder="Ej. Sin intereses" />
        <div className="sm:col-span-2">
          <PublishSwitch name="record.financing_confirmed" label="Financiamiento confirmado: publicar" />
        </div>
      </FieldGroup>

      <FieldGroup title="Requisitos del plan de pagos">
        <TextAreaField name="record.payment_requirements" label="Requisitos" visibility="P*" />
        <div className="flex items-end">
          <PublishSwitch name="record.publish_payment_requirements" />
        </div>
      </FieldGroup>

      <FieldGroup title="Gastos a cargo del comprador">
        <SelectField name="record.buyer_costs_status" label="Estado" visibility="P*" options={BUYER_COSTS_STATUS_LABELS} />
        <TextAreaField name="record.buyer_costs" label="Detalle de gastos" visibility="P*"
          hint='Si el estado es "Por confirmar", la web muestra solo "Por confirmar"' />
        <div className="sm:col-span-2">
          <PublishSwitch name="record.publish_buyer_costs" />
        </div>
      </FieldGroup>
    </div>
  );
};

// E. Servicios
export const SectionServicios = () => {
  const services = useWatch<FichaValues, 'services'>({ name: 'services' });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        El estado de cada servicio es público. La evidencia es interna y es{' '}
        <strong>obligatoria</strong> para marcar un servicio como instalado en el lote.
      </p>
      <div className="divide-y rounded-lg border">
        {SERVICES.map((service) => (
          <div key={service} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <SelectField name={`services.${service}.status`} label={SERVICE_LABELS[service]} visibility="P"
              options={SERVICE_STATUS_LABELS} />
            <TextAreaField name={`services.${service}.evidence_note`} label="Evidencia / nota" visibility="I" rows={2}
              required={services?.[service]?.status === 'instalado_en_lote'}
              placeholder="Ej. Recibo de CESPT de octubre 2026" />
          </div>
        ))}
      </div>
    </div>
  );
};

// F. Situación documental
export const SectionDocumentacion = () => {
  const { control, register } = useFormContext<FichaValues>();
  return (
    <div className="space-y-8">
      <FieldGroup title="Tenencia">
        <SelectField name="record.tenure_type" label="Tipo de tenencia" visibility="P*" options={TENURE_LABELS} allowEmpty />
        <div className="flex items-end">
          <PublishSwitch name="record.publish_tenure" />
        </div>
      </FieldGroup>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-base font-medium">Checklist documental</h3>
          <VisibilityBadge visibility="I" />
        </div>
        <p className="text-sm text-muted-foreground">
          Solo el estado de cada documento. Los archivos van en la carpeta de Drive (pestaña Material), nunca en el sitio.
        </p>
        <div className="divide-y rounded-lg border">
          {DOCUMENT_TYPES.map((doc) => (
            <div key={doc} className="grid grid-cols-2 items-center gap-3 p-3 sm:grid-cols-[1fr_auto_auto_9rem_1fr]">
              <span className="col-span-2 text-sm font-medium sm:col-span-1">{DOCUMENT_LABELS[doc]}</span>
              <label className="flex items-center gap-2 text-sm">
                <Controller control={control} name={`documents.${doc}.received`} render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                )} />
                Recibido
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Controller control={control} name={`documents.${doc}.reviewed`} render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                )} />
                Revisado
              </label>
              <Input type="date" aria-label={`Fecha de revisión de ${DOCUMENT_LABELS[doc]}`}
                {...register(`documents.${doc}.reviewed_at`)} />
              <Input placeholder="Nota" aria-label={`Nota de ${DOCUMENT_LABELS[doc]}`}
                {...register(`documents.${doc}.note`)} />
            </div>
          ))}
        </div>
      </div>

      <FieldGroup title="Revisión" description="Para publicar: checklist revisado (nombre y fecha) y sin alertas abiertas.">
        <TextField name="record.docs_reviewed_by" label="Revisado por" visibility="I" />
        <TextField name="record.docs_reviewed_at" label="Fecha de revisión" visibility="I" type="date" />
        <TextAreaField name="record.open_alerts" label="Alertas abiertas" visibility="I" className="sm:col-span-2"
          hint="Mientras haya texto aquí la propiedad no se puede publicar" />
      </FieldGroup>
    </div>
  );
};

// G. Posicionamiento comercial
export const SectionComercial = () => (
  <div className="space-y-8">
    <FieldGroup>
      <TextAreaField name="property.description" label="Descripción" visibility="P" rows={5} className="sm:col-span-2"
        hint="Se publica tal cual. No pongas aquí notas internas." />
    </FieldGroup>

    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-sans text-base font-medium">Diferenciadores comprobables (máx. {MAX_DIFFERENTIATORS})</h3>
        <VisibilityBadge visibility="P" />
      </div>
      <p className="text-sm text-muted-foreground">Hechos verificables. Sin promesas de plusvalía ni de rendimiento.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: MAX_DIFFERENTIATORS }, (_, i) => (
          <TextField key={i} name={`property.differentiators.${i}`} label={`Diferenciador ${i + 1}`}
            placeholder={['Ej. Lote en esquina', 'Ej. Escritura lista', 'Ej. A 300 m de la playa'][i]} />
        ))}
      </div>
    </div>

    <FieldGroup>
      <TextField name="property.cta" label="Llamada a la acción principal" visibility="P"
        placeholder="Ej. Agenda tu visita este fin de semana" />
      <TextField name="record.buyer_profile" label="Perfil de comprador" visibility="I" />
      <TextAreaField name="record.unpublished_notes" label="Datos que NO se publican" visibility="I" className="sm:col-span-2" />
    </FieldGroup>
  </div>
);

// H. Material
export const SectionMaterial = ({
  minPhotos, uploading, onUploadingChange,
}: { minPhotos: number; uploading: boolean; onUploadingChange: (uploading: boolean) => void }) => {
  const { control } = useFormContext<FichaValues>();
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-base font-medium">Fotos</h3>
          <VisibilityBadge visibility="P" />
        </div>
        <p className="text-sm text-muted-foreground">
          La primera es la portada del catálogo. Usa la estrella para cambiarla y las flechas para ordenar.
        </p>
        <Controller control={control} name="property.images" render={({ field }) => (
          <GalleryEditor value={field.value} onChange={field.onChange} minPhotos={minPhotos}
            uploading={uploading} onUploadingChange={onUploadingChange} />
        )} />
      </div>

      <FieldGroup>
        <TextField name="property.video_url" label="Video (YouTube, Vimeo u otro enlace)" visibility="P" type="url"
          placeholder="https://youtu.be/…" />
        <TextField name="record.photos_taken_at" label="Fecha de las tomas" visibility="I" type="date" />
        <TextField name="record.drive_url" label="Carpeta de Drive de la propiedad" visibility="I" type="url"
          className="sm:col-span-2" placeholder="https://drive.google.com/…"
          hint="Documentos y evidencias van aquí. Los permisos se controlan en Drive." />
      </FieldGroup>
    </div>
  );
};

// I. Verificación
export const SectionVerificacion = ({ fichaVersion }: { fichaVersion?: number }) => (
  <div className="space-y-8">
    <FieldGroup description="Para publicar, la última verificación debe tener menos de 15 días y debe haber aprobación del responsable.">
      <TextField name="record.last_verified_at" label="Última verificación con el propietario" visibility="I" type="date" />
      <TextField name="record.last_verified_via" label="Medio de verificación" visibility="I" placeholder="Ej. Llamada, WhatsApp, visita" />
      <TextField name="record.verified_by" label="Verificado por" visibility="I" />
      <div />
      <TextField name="record.approved_by" label="Aprobado para publicar por" visibility="I" />
      <TextField name="record.approved_at" label="Fecha de aprobación" visibility="I" type="date" />
    </FieldGroup>
    {fichaVersion != null && (
      <p className="text-sm text-muted-foreground">
        Versión de la ficha: <span className="font-mono">{fichaVersion}</span> (sube en cada guardado)
      </p>
    )}
  </div>
);
