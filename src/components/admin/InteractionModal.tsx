import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InteractionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
}

const interactionTypes = [
  { value: 'llamada', label: '📞 Llamada' },
  { value: 'email', label: '✉️ Email' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'reunion', label: '🤝 Reunión' },
  { value: 'visita', label: '🏠 Visita' },
  { value: 'nota', label: '📝 Nota' },
];

const InteractionModal = ({ open, onOpenChange, leadId }: InteractionModalProps) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) throw new Error('No lead selected');
      
      const { error } = await supabase.from('interactions').insert({
        lead_id: leadId,
        type,
        description: description || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Interacción registrada',
        description: 'La actividad se ha guardado correctamente.',
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo registrar la interacción.',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    setType('');
    setDescription('');
    setScheduledAt('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      toast({
        title: 'Error',
        description: 'Selecciona un tipo de actividad.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Interacción</DialogTitle>
          <DialogDescription>
            Registra una nueva actividad de seguimiento con este prospecto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de actividad *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la interacción..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled">Fecha programada (opcional)</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Para actividades futuras como reuniones o visitas
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InteractionModal;
