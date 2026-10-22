-- Los admins pueden ver todas las propiedades (incluidas inactivas y vendidas).
-- Antes solo existia la politica publica con status = 'active'.
CREATE POLICY "Admins can view all properties"
ON public.properties
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Restringir la insercion anonima de leads: solo leads nuevos desde los
-- formularios publicos, sin presupuesto y con longitudes acotadas.
-- Los admins siguen usando la politica "Admins can insert leads".
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;

CREATE POLICY "Public can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (
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
