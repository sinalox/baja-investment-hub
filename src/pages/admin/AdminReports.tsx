import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, TrendingUp, Target, DollarSign } from 'lucide-react';

interface Lead {
  id: string;
  status: string;
  property_type: string;
  budget_max: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  nuevo: '#3b82f6',
  contactado: '#eab308',
  calificado: '#a855f7',
  ganado: '#22c55e',
  perdido: '#ef4444',
};

const AdminReports = () => {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, status, property_type, budget_max, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Lead[];
    },
  });

  // Calculate metrics
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !['ganado', 'perdido'].includes(l.status)).length;
  const wonLeads = leads.filter(l => l.status === 'ganado').length;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';
  const potentialValue = leads
    .filter(l => !['ganado', 'perdido'].includes(l.status) && l.budget_max)
    .reduce((sum, l) => sum + (l.budget_max || 0), 0);

  // Leads by month (last 6 months)
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

  // Leads by status
  const statusData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: statusColors[status] || '#94a3b8',
  }));

  // Leads by property type
  const typeData = Object.entries(
    leads.reduce((acc, lead) => {
      acc[lead.property_type] = (acc[lead.property_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  }));

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

  const chartConfig = {
    leads: {
      label: 'Leads',
      color: 'hsl(var(--accent))',
    },
    count: {
      label: 'Cantidad',
      color: 'hsl(var(--primary))',
    },
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-muted-foreground">
          Cargando reportes...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis y métricas del CRM inmobiliario
          </p>
        </div>

        {/* KPI Cards */}
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

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Leads Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Leads por Mes</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
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

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Estado actual de los leads</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No hay datos disponibles
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Leads by Property Type */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Interés por Tipo de Propiedad</CardTitle>
              <CardDescription>Distribución de leads según tipo de propiedad</CardDescription>
            </CardHeader>
            <CardContent>
              {typeData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No hay datos disponibles
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeData} layout="vertical">
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="type" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
