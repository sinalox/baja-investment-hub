import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Home, Landmark, TrendingUp, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyStats {
  total: number;
  casas: number;
  oficinas: number;
  lotes: number;
  inversion: number;
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

  const statCards = [
    { title: 'Total Propiedades', value: stats.total, icon: Building2, color: 'text-primary' },
    { title: 'Casas', value: stats.casas, icon: Home, color: 'text-blue-500' },
    { title: 'Oficinas', value: stats.oficinas, icon: Building2, color: 'text-green-500' },
    { title: 'Lotes', value: stats.lotes, icon: Landmark, color: 'text-orange-500' },
    { title: 'Inversión', value: stats.inversion, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-semibold">Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen general del catálogo de propiedades
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva propiedad
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/admin/properties">
                <Building2 className="h-4 w-4 mr-2" />
                Ver todas las propiedades
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
