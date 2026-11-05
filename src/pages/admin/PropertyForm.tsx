import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PublishPanel from '@/components/admin/ficha/PublishPanel';
import { useFichaSettings } from '@/components/admin/ficha/useFichaSettings';
import FichaPdfButtons from '@/components/admin/ficha/FichaPdfButtons';
import {
  SectionComercial,
  SectionDocumentacion,
  SectionIdentificacion,
  SectionMaterial,
  SectionPrecio,
  SectionServicios,
  SectionSuperficie,
  SectionUbicacion,
  SectionVerificacion,
} from '@/components/admin/ficha/sections';
import {
  fichaSchema,
  toDocumentRows,
  toFormValues,
  toPropertyPayload,
  toRecordPayload,
  toServiceRows,
  type FichaValues,
  type WorkflowStatus,
} from '@/components/admin/ficha/schema';

// Pestañas = secciones A–I del spec
const TABS = [
  { id: 'A', label: 'Identificación' },
  { id: 'B', label: 'Ubicación' },
  { id: 'C', label: 'Superficie' },
  { id: 'D', label: 'Precio' },
  { id: 'E', label: 'Servicios' },
  { id: 'F', label: 'Documentación' },
  { id: 'G', label: 'Comercial' },
  { id: 'H', label: 'Material' },
  { id: 'I', label: 'Verificación' },
] as const;
type TabId = (typeof TABS)[number]['id'];

// Pestaña de cada campo, para llevar al usuario al primer error
const FIELD_TABS: Record<string, TabId> = {
  title: 'A', type: 'A', featured: 'A', owner_name: 'A', owner_contact: 'A', contract_type: 'A', contract_valid_until: 'A',
  location: 'B', arrival_reference: 'B', distances: 'B', access_status: 'B', maps_url: 'B', publish_exact_location: 'B',
  area_m2: 'C', built_area_m2: 'C', frontage_m: 'C', depth_m: 'C', measures_note: 'C', lot_type: 'C', topography: 'C', beds: 'C', baths: 'C',
  deed_area_m2: 'C', real_area_m2: 'C', measures_differ: 'C', measures_diff_note: 'C', land_use: 'C', land_use_confirmed: 'C',
  price: 'D', currency: 'D', down_payment: 'D', term_months: 'D', monthly_payment: 'D', interest_and_fees: 'D',
  financing_confirmed: 'D', payment_requirements: 'D', publish_payment_requirements: 'D', buyer_costs: 'D',
  buyer_costs_status: 'D', publish_buyer_costs: 'D', price_valid_until: 'D', price_verified_at: 'D',
  tenure_type: 'F', publish_tenure: 'F', open_alerts: 'F', docs_reviewed_by: 'F', docs_reviewed_at: 'F',
  description: 'G', differentiators: 'G', cta: 'G', buyer_profile: 'G', unpublished_notes: 'G',
  images: 'H', video_url: 'H', photos_taken_at: 'H', drive_url: 'H',
  last_verified_at: 'I', last_verified_via: 'I', verified_by: 'I', approved_by: 'I', approved_at: 'I',
};

const firstErrorTab = (errors: FieldErrors<FichaValues>): TabId => {
  if (errors.property || errors.record) {
    const group = (errors.property ?? errors.record) as Record<string, unknown>;
    const field = Object.keys(group)[0];
    return FIELD_TABS[field] ?? 'A';
  }
  if (errors.services) return 'E';
  if (errors.documents) return 'F';
  return 'A';
};

const PropertyForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<TabId>('A');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FichaValues>({
    resolver: zodResolver(fichaSchema),
    defaultValues: toFormValues(),
    mode: 'onTouched',
  });
  const { formState: { isDirty }, reset, watch } = form;
  const propertyType = watch('property.type');

  const { maxVerificationDays, minPhotosFor } = useFichaSettings();

  // La ficha completa: propiedad + ficha interna + servicios + documentos
  const { data: ficha, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-ficha', id],
    queryFn: async () => {
      const [property, record, services, documents] = await Promise.all([
        supabase.from('properties').select('*').eq('id', id!).single(),
        supabase.from('property_records').select('*').eq('property_id', id!).maybeSingle(),
        supabase.from('property_services').select('*').eq('property_id', id!),
        supabase.from('property_documents').select('*').eq('property_id', id!),
      ]);
      const error = property.error ?? record.error ?? services.error ?? documents.error;
      if (error) throw error;
      return {
        property: property.data,
        record: record.data,
        services: services.data ?? [],
        documents: documents.data ?? [],
      };
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (ficha) {
      reset(toFormValues(ficha.property, ficha.record, ficha.services, ficha.documents));
    }
  }, [ficha, reset]);

  useEffect(() => {
    if (isError) {
      toast({ title: 'Error', description: 'No se pudo cargar la propiedad', variant: 'destructive' });
      navigate('/admin/properties');
    }
  }, [isError, navigate, toast]);

  // Avisar antes de salir con cambios sin guardar
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const invalidateAll = (propertyId: string) => {
    for (const key of [
      ['admin-properties'], ['admin-ficha', propertyId], ['publish-blockers', propertyId],
      ['property-stats'], ['public-properties'], ['property', propertyId],
    ]) {
      queryClient.invalidateQueries({ queryKey: key });
    }
  };

  // Guardar en orden: propiedad → servicios y documentos → ficha interna al
  // final (su trigger sube ficha_version una vez por guardado)
  const onSubmit = async (values: FichaValues) => {
    setSaving(true);
    try {
      let propertyId = id;
      const payload = toPropertyPayload(values, ficha?.property.area ?? '');

      if (propertyId) {
        const { error } = await supabase.from('properties').update(payload).eq('id', propertyId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('properties').insert(payload).select('id').single();
        if (error) throw error;
        propertyId = data.id;
      }

      const [services, documents] = await Promise.all([
        supabase.from('property_services').upsert(toServiceRows(propertyId, values), { onConflict: 'property_id,service' }),
        supabase.from('property_documents').upsert(toDocumentRows(propertyId, values), { onConflict: 'property_id,doc_type' }),
      ]);
      if (services.error) throw services.error;
      if (documents.error) throw documents.error;

      const { error: recordError } = await supabase
        .from('property_records')
        .update(toRecordPayload(values))
        .eq('property_id', propertyId);
      if (recordError) throw recordError;

      toast({ title: 'Ficha guardada', description: isEditing ? 'Los cambios se guardaron.' : 'La propiedad se creó como borrador.' });
      invalidateAll(propertyId);

      if (isEditing) {
        await refetch();
      } else {
        reset(values); // evita el aviso de cambios sin guardar al navegar
        navigate(`/admin/properties/${propertyId}/edit`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving ficha:', error);
      toast({
        title: 'No se pudo guardar',
        description: error instanceof Error ? error.message : 'Intenta de nuevo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = (errors: FieldErrors<FichaValues>) => {
    setTab(firstErrorTab(errors));
    toast({ title: 'Revisa la ficha', description: 'Hay campos con errores marcados en rojo.', variant: 'destructive' });
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const record = ficha?.record;
  const minPhotos = minPhotosFor(propertyType);

  return (
    <AdminLayout>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="mx-auto max-w-6xl space-y-6 pb-24">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-sans font-semibold">
                {isEditing ? ficha?.property.title || 'Editar propiedad' : 'Nueva propiedad'}
              </h1>
              <p className="text-muted-foreground">
                Ficha técnica FT-01
                {ficha?.property.code && <span className="ml-2 font-mono text-foreground">{ficha.property.code}</span>}
              </p>
            </div>
            {id && record && (
              <FichaPdfButtons
                propertyId={id}
                isPublic={['publicada', 'apartada', 'vendida'].includes(record.workflow_status)}
                size="default"
                label="Ficha PDF"
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
            <div className="lg:order-last">
              <div className="lg:sticky lg:top-6">
                <PublishPanel
                  propertyId={id}
                  workflowStatus={record?.workflow_status as WorkflowStatus | undefined}
                  lastVerifiedAt={record?.last_verified_at}
                  maxVerificationDays={maxVerificationDays}
                  isDirty={isDirty}
                  onChanged={() => id && (invalidateAll(id), refetch())}
                />
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(value as TabId)} className="min-w-0">
              <TabsList className="scroll-row h-auto w-full justify-start gap-1 p-1">
                {TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id} className="shrink-0">
                    <span className="mr-1 text-muted-foreground">{t.id}.</span>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Card className="mt-3">
                <CardContent className="pt-6">
                  <TabsContent value="A" className="mt-0"><SectionIdentificacion code={ficha?.property.code} /></TabsContent>
                  <TabsContent value="B" className="mt-0"><SectionUbicacion /></TabsContent>
                  <TabsContent value="C" className="mt-0"><SectionSuperficie /></TabsContent>
                  <TabsContent value="D" className="mt-0"><SectionPrecio /></TabsContent>
                  <TabsContent value="E" className="mt-0"><SectionServicios /></TabsContent>
                  <TabsContent value="F" className="mt-0"><SectionDocumentacion /></TabsContent>
                  <TabsContent value="G" className="mt-0"><SectionComercial /></TabsContent>
                  <TabsContent value="H" className="mt-0" forceMount hidden={tab !== 'H'}>
                    {/* forceMount: una subida en curso no se pierde al cambiar de pestaña */}
                    <SectionMaterial minPhotos={minPhotos} uploading={uploading} onUploadingChange={setUploading} />
                  </TabsContent>
                  <TabsContent value="I" className="mt-0"><SectionVerificacion fichaVersion={record?.ficha_version} /></TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          {/* Barra de guardado fija */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3">
              {isDirty && <span className="mr-auto text-sm text-amber-700">Cambios sin guardar</span>}
              <Button type="button" variant="outline" onClick={() => navigate('/admin/properties')}>
                Volver
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {uploading ? 'Subiendo fotos…' : isEditing ? 'Guardar ficha' : 'Crear borrador'}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </AdminLayout>
  );
};

export default PropertyForm;
