import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, Lock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WORKFLOW_STATUS_LABELS } from '@/lib/properties';
import { WORKFLOW_STATUSES, isVerificationExpired, type WorkflowStatus } from './schema';

interface PublishPanelProps {
  propertyId?: string;
  workflowStatus?: WorkflowStatus;
  lastVerifiedAt?: string | null;
  maxVerificationDays: number;
  // Hay cambios sin guardar: el candado se evalúa sobre lo guardado
  isDirty: boolean;
  onChanged: () => void;
}

const statusVariant = (status?: WorkflowStatus) =>
  status === 'publicada' ? 'default' : status === 'apartada' || status === 'vendida' ? 'secondary' : 'outline';

// Panel del candado "Listo para publicar". La regla real vive en la base
// (trigger + RPC publish_blockers): aquí solo se muestra y se usa.
const PublishPanel = ({
  propertyId, workflowStatus, lastVerifiedAt, maxVerificationDays, isDirty, onChanged,
}: PublishPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<WorkflowStatus | ''>('');

  const { data: blockers = [], isLoading: loadingBlockers } = useQuery({
    queryKey: ['publish-blockers', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('publish_blockers', { p_property_id: propertyId! });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!propertyId,
  });

  const changeStatus = useMutation({
    mutationFn: async (status: WorkflowStatus) => {
      const { error } = await supabase
        .from('property_records')
        .update({ workflow_status: status })
        .eq('property_id', propertyId!);
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      toast({ title: 'Estado actualizado', description: `La propiedad ahora está: ${WORKFLOW_STATUS_LABELS[status]}` });
      setTarget('');
      queryClient.invalidateQueries({ queryKey: ['publish-blockers', propertyId] });
      onChanged();
    },
    onError: (error: Error) => {
      // El trigger explica por qué no se pudo (p. ej. "No se puede publicar: …")
      toast({ title: 'No se pudo cambiar el estado', description: error.message, variant: 'destructive' });
    },
  });

  if (!propertyId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Publicación</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Guarda la propiedad por primera vez para recibir su folio y empezar el flujo. Se crea como borrador
          y no aparece en la web.
        </CardContent>
      </Card>
    );
  }

  const ready = blockers.length === 0;
  const isPublic = workflowStatus === 'publicada' || workflowStatus === 'apartada';
  const verificationExpired = isPublic && isVerificationExpired(lastVerifiedAt, maxVerificationDays);

  const disabledReason = (status: WorkflowStatus): string | null => {
    if (status === workflowStatus) return 'Estado actual';
    if (status === 'publicada' && !ready) return 'Faltan requisitos';
    if (status === 'apartada' && workflowStatus !== 'publicada') return 'Solo desde publicada';
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          Publicación
          <Badge variant={statusVariant(workflowStatus)}>
            {workflowStatus ? WORKFLOW_STATUS_LABELS[workflowStatus] : '—'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {verificationExpired && (
          <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Verificación vencida: la última verificación tiene más de {maxVerificationDays} días. Sigue publicada,
              pero conviene volver a verificar con el propietario.
            </span>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Lock className="h-4 w-4" />
            Listo para publicar
          </div>
          {loadingBlockers ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : ready ? (
            <p className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Cumple todos los requisitos
            </p>
          ) : (
            <ul className="space-y-1.5">
              {blockers.map((blocker) => (
                <li key={blocker} className="flex gap-2 text-muted-foreground">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                  {blocker}
                </li>
              ))}
            </ul>
          )}
          {isDirty && (
            <p className="mt-2 text-xs text-amber-700">Hay cambios sin guardar: la lista refleja lo último guardado.</p>
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="font-medium">Cambiar estado</p>
          <Select value={target} onValueChange={(value) => setTarget(value as WorkflowStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Elige el nuevo estado" />
            </SelectTrigger>
            <SelectContent>
              {WORKFLOW_STATUSES.map((status) => {
                const reason = disabledReason(status);
                return (
                  <SelectItem key={status} value={status} disabled={!!reason}>
                    {WORKFLOW_STATUS_LABELS[status]}
                    {reason && <span className="ml-1 text-xs text-muted-foreground">({reason})</span>}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            type="button"
            className="w-full"
            disabled={!target || isDirty || changeStatus.isPending}
            onClick={() => target && changeStatus.mutate(target)}
          >
            {changeStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDirty ? 'Guarda los cambios primero' : 'Aplicar estado'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Publicada y apartada se ven en la web; vendida se ve con sello &quot;Vendida&quot;. El resto queda oculto.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublishPanel;
