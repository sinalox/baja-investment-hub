import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquarePlus,
  Home,
  Building2,
  Landmark,
  TrendingUp,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InteractionModal from '@/components/admin/InteractionModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  property_type: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

interface Interaction {
  id: string;
  lead_id: string;
  type: string;
  description: string | null;
  scheduled_at: string | null;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  location: string;
  image_url: string | null;
}

const interactionTypeLabels: Record<string, string> = {
  llamada: 'Llamada',
  email: 'Email',
  reunion: 'Reunión',
  visita: 'Visita',
  nota: 'Nota',
  whatsapp: 'WhatsApp',
};

const interactionTypeIcons: Record<string, string> = {
  llamada: '📞',
  email: '✉️',
  reunion: '🤝',
  visita: '🏠',
  nota: '📝',
  whatsapp: '💬',
};

const propertyTypeIcons: Record<string, React.ReactNode> = {
  casa: <Home className="h-4 w-4" />,
  oficina: <Building2 className="h-4 w-4" />,
  lote: <Landmark className="h-4 w-4" />,
  inversion: <TrendingUp className="h-4 w-4" />,
};

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  // Fetch lead details
  const { data: lead, isLoading: loadingLead } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Lead no encontrado');
      return data as Lead;
    },
    enabled: !!id,
  });

  // Fetch interactions
  const { data: interactions = [] } = useQuery({
    queryKey: ['interactions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Interaction[];
    },
    enabled: !!id,
  });

  // Fetch suggested properties based on lead's property type and budget
  const { data: suggestedProperties = [] } = useQuery({
    queryKey: ['suggested-properties', lead?.property_type, lead?.budget_max],
    queryFn: async () => {
      if (!lead) return [];
      
      let query = supabase
        .from('properties')
        .select('id, title, type, price, currency, location, image_url')
        .eq('type', lead.property_type)
        .eq('status', 'active')
        .limit(5);

      if (lead.budget_max) {
        query = query.lte('price', lead.budget_max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!lead,
  });

  // Update lead mutation
  const updateMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status, notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsEditing(false);
      toast({
        title: 'Lead actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    },
  });

  const handleStartEdit = () => {
    if (lead) {
      setEditedStatus(lead.status);
      setEditedNotes(lead.notes || '');
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({ status: editedStatus, notes: editedNotes });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'bg-blue-500/10 text-blue-600';
      case 'contactado':
        return 'bg-yellow-500/10 text-yellow-600';
      case 'calificado':
        return 'bg-purple-500/10 text-purple-600';
      case 'ganado':
        return 'bg-green-500/10 text-green-600';
      case 'perdido':
        return 'bg-red-500/10 text-red-600';
      default:
        return '';
    }
  };

  const formatCurrency = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loadingLead) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-muted-foreground">
          Cargando información del lead...
        </div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Lead no encontrado</p>
          <Button asChild>
            <Link to="/admin/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a prospectos
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/leads">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-semibold">{lead.name}</h1>
            <p className="text-muted-foreground">Detalle del prospecto</p>
          </div>
          <Button onClick={() => setIsInteractionModalOpen(true)}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Registrar Interacción
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lead Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Información de Contacto</CardTitle>
                  <CardDescription>Datos del prospecto</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{lead.phone}</p>
                    </div>
                  </div>
                  {lead.email && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{lead.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      {propertyTypeIcons[lead.property_type] || <Home className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Interés</p>
                      <p className="font-medium capitalize">{lead.property_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded-lg">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                      <p className="font-medium">
                        {format(new Date(lead.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Budget */}
                {(lead.budget_min || lead.budget_max) && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Presupuesto</p>
                    <p className="font-medium">
                      {lead.budget_min && lead.budget_max
                        ? `${formatCurrency(lead.budget_min, 'MXN')} - ${formatCurrency(lead.budget_max, 'MXN')}`
                        : lead.budget_max
                        ? `Hasta ${formatCurrency(lead.budget_max, 'MXN')}`
                        : `Desde ${formatCurrency(lead.budget_min!, 'MXN')}`}
                    </p>
                  </div>
                )}

                {/* Status & Notes */}
                <div className="pt-4 border-t space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Estado</p>
                    {isEditing ? (
                      <Select value={editedStatus} onValueChange={setEditedStatus}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nuevo">Nuevo</SelectItem>
                          <SelectItem value="contactado">Contactado</SelectItem>
                          <SelectItem value="calificado">Calificado</SelectItem>
                          <SelectItem value="ganado">Ganado</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusBadgeClass(lead.status)}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notas</p>
                    {isEditing ? (
                      <Textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        placeholder="Agregar notas sobre este prospecto..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm">
                        {lead.notes || 'Sin notas'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Interacciones</CardTitle>
                <CardDescription>Seguimiento de actividades con el prospecto</CardDescription>
              </CardHeader>
              <CardContent>
                {interactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay interacciones registradas</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsInteractionModalOpen(true)}
                    >
                      <MessageSquarePlus className="h-4 w-4 mr-2" />
                      Registrar primera interacción
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interactions.map((interaction) => (
                      <div 
                        key={interaction.id} 
                        className="flex gap-4 p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="text-2xl">
                          {interactionTypeIcons[interaction.type] || '📋'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {interactionTypeLabels[interaction.type] || interaction.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(interaction.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                            </span>
                          </div>
                          {interaction.description && (
                            <p className="text-sm text-muted-foreground">
                              {interaction.description}
                            </p>
                          )}
                          {interaction.scheduled_at && (
                            <p className="text-sm text-accent mt-1">
                              📅 Programado: {format(new Date(interaction.scheduled_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Suggested Properties */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Propiedades Sugeridas</CardTitle>
                <CardDescription>
                  Basado en el tipo de interés{lead.budget_max ? ' y presupuesto' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {suggestedProperties.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay propiedades que coincidan con los criterios
                  </p>
                ) : (
                  <div className="space-y-4">
                    {suggestedProperties.map((property) => (
                      <div 
                        key={property.id} 
                        className="border rounded-lg overflow-hidden"
                      >
                        {property.image_url && (
                          <img 
                            src={property.image_url} 
                            alt={property.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-3">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {property.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {property.location}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-accent">
                              {formatCurrency(property.price, property.currency)}
                            </span>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/properties/${property.id}/edit`}>
                                Ver
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <InteractionModal
        open={isInteractionModalOpen}
        onOpenChange={setIsInteractionModalOpen}
        leadId={id || null}
      />
    </AdminLayout>
  );
};

export default LeadDetail;
