-- Corrección de seguridad (2026-10-29).
--
-- En producción se detectó, con la clave pública (anon):
--   * properties: anon lee filas inactivas, inserta y modifica (RLS apagada o
--     políticas abiertas agregadas fuera de las migraciones).
--   * user_roles: anon lee filas (riesgo de escalar a administrador).
--   * Columna properties.address que no existe en ninguna migración.
--
-- Esta migración es idempotente y se puede aplicar en cualquier momento (no
-- depende del deploy del código): el sitio actual sigue leyendo properties
-- con la política "Anyone can view active properties".

-- 1. RLS encendida en todas las tablas de la app
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 2. Borrar cualquier política que no venga de las migraciones (las abiertas
--    que se hayan creado a mano). Se listan con NOTICE para dejar registro.
DO $$
DECLARE
  pol record;
  known text[] := ARRAY[
    -- properties
    'Anyone can view active properties', 'Admins can view all properties',
    'Admins can insert properties', 'Admins can update properties', 'Admins can delete properties',
    -- user_roles
    'Users can view their own roles',
    -- leads
    'Admins can view leads', 'Admins can insert leads', 'Admins can update leads',
    'Admins can delete leads', 'Public can insert leads',
    -- interactions
    'Admins can view interactions', 'Admins can insert interactions',
    'Admins can update interactions', 'Admins can delete interactions',
    -- ficha técnica
    'Admins manage property records', 'Admins manage property services',
    'Admins manage property documents', 'Admins manage app settings'
  ];
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('properties', 'user_roles', 'leads', 'interactions', 'property_records',
                        'property_services', 'property_documents', 'app_settings')
      AND NOT (policyname = ANY (known))
  LOOP
    RAISE NOTICE 'Eliminando política no reconocida "%" en %', pol.policyname, pol.tablename;
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 3. Defensa en profundidad: anon nunca escribe, salvo crear leads desde los
--    formularios públicos (acotado además por "Public can insert leads").
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon;
GRANT INSERT ON public.leads TO anon;

-- 4. Opcional: la columna address no existe en las migraciones, está vacía y
--    vive en una tabla pública (choca con "ubicación exacta = interna").
--    Descomentar si nadie la usa:
-- ALTER TABLE public.properties DROP COLUMN IF EXISTS address;
