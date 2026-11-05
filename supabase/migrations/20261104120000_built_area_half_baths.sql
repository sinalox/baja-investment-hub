-- Metros de construcción y medios baños (2026-11-04).
--
-- * built_area_m2: superficie construida, distinta de la de terreno (area_m2).
--   Pública y opcional: no forma parte del candado (un lote baldío no tiene
--   construcción).
-- * baths pasa de entero a decimal con medios baños (2, 2.5, 3...).
--
-- Aplicar ANTES de publicar el código que la lee: el sitio pide la columna
-- built_area_m2 a public_properties. Idempotente.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS built_area_m2 numeric(12, 2) CHECK (built_area_m2 > 0);

-- La vista depende de baths: hay que quitarla para cambiar el tipo
DROP VIEW IF EXISTS public.public_properties;

ALTER TABLE public.properties ALTER COLUMN baths TYPE numeric(3, 1);
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_baths_half_steps;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_baths_half_steps
  CHECK (baths IS NULL OR (baths >= 0 AND baths * 2 = trunc(baths * 2)));

-- Misma vista que 20261026120000_ficha_tecnica.sql más built_area_m2
CREATE VIEW public.public_properties AS
SELECT
  p.id,
  p.code,
  p.title,
  p.type,
  p.status,
  p.featured,
  p.location,
  p.arrival_reference,
  p.distances,
  p.access_status,
  p.area,
  p.area_m2,
  p.frontage_m,
  p.depth_m,
  p.measures_note,
  p.lot_type,
  p.topography,
  p.beds,
  p.baths,
  p.price,
  p.currency,
  p.description,
  p.differentiators,
  p.cta,
  p.images,
  p.image_url,
  p.video_url,
  CASE WHEN r.publish_exact_location THEN r.maps_url END AS maps_url,
  CASE WHEN r.land_use_confirmed THEN r.land_use END AS land_use,
  CASE WHEN r.financing_confirmed THEN r.down_payment END AS down_payment,
  CASE WHEN r.financing_confirmed THEN r.term_months END AS term_months,
  CASE WHEN r.financing_confirmed THEN r.monthly_payment END AS monthly_payment,
  CASE WHEN r.financing_confirmed THEN r.interest_and_fees END AS interest_and_fees,
  CASE WHEN r.publish_payment_requirements THEN r.payment_requirements END AS payment_requirements,
  CASE WHEN r.publish_buyer_costs THEN r.buyer_costs_status END AS buyer_costs_status,
  CASE WHEN r.publish_buyer_costs AND r.buyer_costs_status = 'confirmado'
    THEN r.buyer_costs END AS buyer_costs,
  CASE WHEN r.publish_tenure THEN r.tenure_type END AS tenure_type,
  r.price_verified_at AS price_updated_at,
  coalesce(
    (SELECT jsonb_object_agg(s.service, s.status)
     FROM public.property_services s
     WHERE s.property_id = p.id),
    '{}'::jsonb
  ) AS services,
  p.built_area_m2
FROM public.properties p
LEFT JOIN public.property_records r ON r.property_id = p.id
WHERE p.status IN ('active', 'reserved', 'sold');

REVOKE ALL ON public.public_properties FROM PUBLIC;
GRANT SELECT ON public.public_properties TO anon, authenticated;
