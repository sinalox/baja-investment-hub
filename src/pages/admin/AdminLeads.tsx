import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Eye, 
  Trash2, 
  Search,
  MessageSquarePlus,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InteractionModal from '@/components/admin/InteractionModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type LeadStatus = 'nuevo' | 'contactado' | 'calificado' | 'ganado' | 'perdido';

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

const statusConfig: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  nuevo: { label: 'Nuevo', variant: 'default' },
  contactado: { label: 'Contactado', variant: 'secondary' },
  calificado: { label: 'Calificado', variant: 'outline' },
  ganado: { label: 'Ganado', variant: 'default' },
  perdido: { label: 'Perdido', variant: 'destructive' },
};

const propertyTypeLabels: Record<string, string> = {
  casa: 'Casa',
  oficina: 'Oficina',
  lote: 'Lote Residencial',
  inversion: 'Terreno de Inversión',
};

const AdminLeads = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('property_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lead[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead eliminado',
        description: 'El prospecto ha sido eliminado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el lead.',
        variant: 'destructive',
      });
    },
  });

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone.includes(query)
    );
  });

  const handleOpenInteractionModal = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsInteractionModalOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case 'contactado':
        return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
      case 'calificado':
        return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20';
      case 'ganado':
        return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'perdido':
        return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
      default:
        return '';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Prospectos</h1>
            <p className="text-muted-foreground">
              Gestión de leads y seguimiento de clientes potenciales
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="contactado">Contactado</SelectItem>
                  <SelectItem value="calificado">Calificado</SelectItem>
                  <SelectItem value="ganado">Ganado</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo de propiedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="oficina">Oficina</SelectItem>
                  <SelectItem value="lote">Lote Residencial</SelectItem>
                  <SelectItem value="inversion">Terreno de Inversión</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lista de Prospectos ({filteredLeads.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando prospectos...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron prospectos
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Tipo de Interés</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {propertyTypeLabels[lead.property_type] || lead.property_type}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(lead.status)}>
                            {statusConfig[lead.status as LeadStatus]?.label || lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(lead.created_at), 'dd MMM yyyy', { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenInteractionModal(lead.id)}
                              title="Registrar interacción"
                            >
                              <MessageSquarePlus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/leads/${lead.id}`} title="Ver detalle">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('¿Eliminar este prospecto?')) {
                                  deleteMutation.mutate(lead.id);
                                }
                              }}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <InteractionModal
        open={isInteractionModalOpen}
        onOpenChange={setIsInteractionModalOpen}
        leadId={selectedLeadId}
      />
    </AdminLayout>
  );
};

export default AdminLeads;
