import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';

// Raíz de todas las rutas /admin. Vive en su propio chunk para que la
// autenticación (y el cliente completo de Supabase) no se cargue en el sitio
// público.
const AdminRoot = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export default AdminRoot;
