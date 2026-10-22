import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";

// Solo la landing va en el bundle inicial; el resto (y todo el admin, con
// recharts y el cliente completo de Supabase) se descarga al navegar a esa ruta
const NotFound = lazy(() => import("./pages/NotFound"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AdminRoot = lazy(() => import("./components/admin/AdminRoot"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const PropertyForm = lazy(() => import("./pages/admin/PropertyForm"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const LeadDetail = lazy(() => import("./pages/admin/LeadDetail"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />

          <Route element={<AdminRoot />}>
            <Route path="/admin/login" element={<AdminAuth />} />
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/properties/new" element={<PropertyForm />} />
              <Route path="/admin/properties/:id/edit" element={<PropertyForm />} />
              <Route path="/admin/leads" element={<AdminLeads />} />
              <Route path="/admin/leads/:id" element={<LeadDetail />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
