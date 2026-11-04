-- Restaura el conjunto completo de políticas RLS esperado (2026-10-29).
--
-- La base de producción no se creó con estas migraciones y sus políticas
-- tenían otros nombres; 20261029120000_security_hardening.sql las eliminó por
-- no reconocerlas, incluida la lectura pública de propiedades activas (la web
-- se quedó sin propiedades) y posiblemente las de admin.
--
-- Idempotente: cada política se borra si existe y se crea con la definición
-- exacta de las migraciones, sin depender del estado previo.

-- properties ---------------------------------------------------------------
-- (La lectura pública la quita después 20261026120100_ficha_tecnica_revoke.sql,
--  cuando el sitio ya lea la vista public_properties.)
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
CREATE POLICY "Anyone can view active properties" ON public.properties
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
CREATE POLICY "Admins can insert properties" ON public.properties
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
CREATE POLICY "Admins can update properties" ON public.properties
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
CREATE POLICY "Admins can delete properties" ON public.properties
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- user_roles: cada usuario ve solo sus roles (el login del admin lo necesita)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- leads ----------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
CREATE POLICY "Admins can view leads" ON public.leads
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert leads" ON public.leads;
CREATE POLICY "Admins can insert leads" ON public.leads
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Formularios públicos (misma definición que 20261022120000)
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads
  FOR INSERT WITH CHECK (
    status = 'nuevo'
    AND source IN ('formulario_web', 'pagina_propiedad')
    AND budget_min IS NULL
    AND budget_max IS NULL
    AND property_type IN ('casa', 'oficina', 'lote', 'inversion')
    AND char_length(name) BETWEEN 1 AND 100
    AND char_length(phone) BETWEEN 1 AND 20
    AND (email IS NULL OR char_length(email) <= 255)
    AND (notes IS NULL OR char_length(notes) <= 1500)
  );

-- interactions -----------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view interactions" ON public.interactions;
CREATE POLICY "Admins can view interactions" ON public.interactions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert interactions" ON public.interactions;
CREATE POLICY "Admins can insert interactions" ON public.interactions
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update interactions" ON public.interactions;
CREATE POLICY "Admins can update interactions" ON public.interactions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete interactions" ON public.interactions;
CREATE POLICY "Admins can delete interactions" ON public.interactions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ficha técnica (solo admin) ------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage property records" ON public.property_records;
CREATE POLICY "Admins manage property records" ON public.property_records
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage property services" ON public.property_services;
CREATE POLICY "Admins manage property services" ON public.property_services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage property documents" ON public.property_documents;
CREATE POLICY "Admins manage property documents" ON public.property_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage app settings" ON public.app_settings;
CREATE POLICY "Admins manage app settings" ON public.app_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
