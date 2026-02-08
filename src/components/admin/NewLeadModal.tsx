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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewLeadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const propertyTypes = [
    { value: 'casa', label: 'Casa' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'lote', label: 'Lote Residencial' },
    { value: 'inversion', label: 'Terreno de Inversión' },
];

const sources = [
    { value: 'formulario_web', label: 'Formulario Web' },
    { value: 'llamada', label: 'Llamada Telefónica' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'referido', label: 'Referido' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'otro', label: 'Otro' },
];

const NewLeadModal = ({ open, onOpenChange }: NewLeadModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        property_type: 'casa',
        budget_min: '',
        budget_max: '',
        source: 'otro',
        notes: '',
    });

    const { toast } = useToast();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('leads').insert({
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone,
                property_type: formData.property_type,
                budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
                budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
                source: formData.source,
                notes: formData.notes || null,
                status: 'nuevo',
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            toast({
                title: 'Prospecto creado',
                description: 'El nuevo prospecto ha sido agregado correctamente.',
            });
            handleClose();
        },
        onError: (error) => {
            console.error('Error creating lead:', error);
            toast({
                title: 'Error',
                description: 'No se pudo crear el prospecto.',
                variant: 'destructive',
            });
        },
    });

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            property_type: 'casa',
            budget_min: '',
            budget_max: '',
            source: 'otro',
            notes: '',
        });
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast({
                title: 'Error',
                description: 'El nombre y teléfono son requeridos.',
                variant: 'destructive',
            });
            return;
        }
        createMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Prospecto</DialogTitle>
                    <DialogDescription>
                        Agrega un nuevo prospecto de forma manual para dar seguimiento.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Juan Pérez"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Ej: 646-123-4567"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="property_type">Tipo de interés *</Label>
                            <Select
                                value={formData.property_type}
                                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {propertyTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="source">Fuente</Label>
                            <Select
                                value={formData.source}
                                onValueChange={(value) => setFormData({ ...formData, source: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sources.map((src) => (
                                        <SelectItem key={src.value} value={src.value}>
                                            {src.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget_min">Presupuesto mínimo</Label>
                            <Input
                                id="budget_min"
                                type="number"
                                value={formData.budget_min}
                                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                                placeholder="Ej: 1000000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget_max">Presupuesto máximo</Label>
                            <Input
                                id="budget_max"
                                type="number"
                                value={formData.budget_max}
                                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                                placeholder="Ej: 5000000"
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Información adicional sobre el prospecto..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Guardando...' : 'Crear Prospecto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default NewLeadModal;
