-- Ficha técnica FT-01 — parte 1b.
--
-- APLICAR SOLO DESPUÉS de publicar el código que lee public_properties.
-- Si se aplica antes, la landing en producción se queda sin propiedades.
--
-- A partir de aquí el público solo lee la vista public_properties; la tabla
-- properties queda solo para admins (política "Admins can view all properties").
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
REVOKE SELECT ON public.properties FROM anon;
