import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Building2, 
  Home, 
  Landmark, 
  TrendingUp, 
  Plus, 
  Users,
  Target,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface PropertyStats {
  total: number;
  casas: number;
  oficinas: number;
  lotes: number;
  inversion: number;
}

interface Lead {
  id: string;
  status: string;
  budget_max: number | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<PropertyStats>({
    total: 0,
    casas: 0,
    oficinas: 0,
    lotes: 0,
    inversion: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('type');

      if (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
        return;
      }

      const counts = {
        total: data.length,
        casas: data.filter(p => p.type === 'casa').length,
        oficinas: data.filter(p => p.type === 'oficina').length,
        lotes: data.filter(p => p.type === 'lote').length,
        inversion: data.filter(p => p.type === 'inversion').length,
      };

      setStats(counts);
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Fetch leads data
  const { data: leads = [] } = useQuery({
    queryKey: ['leads-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, status, budget_max, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Calculate lead metrics
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !['ganado', 'perdido'].includes(l.status)).length;
  const wonLeads = leads.filter(l => l.status === 'ganado').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';
  const potentialValue = leads
    .filter(l => !['ganado', 'perdido'].includes(l.status) && l.budget_max)
    .reduce((sum, l) => sum + (l.budget_max || 0), 0);

  // Monthly leads data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const count = leads.filter(l => {
      const createdAt = new Date(l.created_at);
      return createdAt >= start && createdAt <= end;
    }).length;

    return {
      month: format(date, 'MMM', { locale: es }),
      leads: count,
    };
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const propertyCards = [
    { title: 'Total Propiedades', value: stats.total, icon: Building2, color: 'text-primary' },
    { title: 'Casas', value: stats.casas, icon: Home, color: 'text-blue-500' },
    { title: 'Oficinas', value: stats.oficinas, icon: Building2, color: 'text-green-500' },
    { title: 'Lotes', value: stats.lotes, icon: Landmark, color: 'text-orange-500' },
    { title: 'Inversión', value: stats.inversion, icon: TrendingUp, color: 'text-purple-500' },
  ];

  const chartConfig = {
    leads: {
      label: 'Leads',
      color: 'hsl(var(--accent))',
    },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen general del CRM inmobiliario
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva propiedad
            </Link>
          </Button>
        </div>

        {/* Lead KPIs */}
        <div>
          <h2 className="text-lg font-medium mb-4">Métricas de Ventas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Leads Activos
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeLeads}</div>
                <p className="text-xs text-muted-foreground">
                  de {totalLeads} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tasa de Conversión
                </CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {wonLeads} leads ganados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Leads Este Mes
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {monthlyData[monthlyData.length - 1]?.leads || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  nuevos prospectos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Potencial
                </CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(potentialValue)}</div>
                <p className="text-xs text-muted-foreground">
                  en leads activos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leads Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Leads por Mes</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/leads">
                Ver todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="leads" 
                    fill="hsl(var(--accent))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Property Stats */}
        <div>
          <h2 className="text-lg font-medium mb-4">Inventario de Propiedades</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {propertyCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/admin/leads">
                <Users className="h-4 w-4 mr-2" />
                Ver prospectos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/properties">
                <Building2 className="h-4 w-4 mr-2" />
                Ver propiedades
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Agregar propiedad
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
