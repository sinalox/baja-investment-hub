-- Ficha técnica FT-01 (docs/ficha-tecnica-spec.md) — parte 1a, aditiva.
--
-- Se puede aplicar con el sitio actual en producción: no quita el acceso
-- público a properties. Eso lo hace 20261026120100_ficha_tecnica_revoke.sql,
-- que se aplica DESPUÉS de publicar el código que lee public_properties.
--
-- Dónde vive cada dato:
--   properties          campos P (públicos)
--   property_records    campos I y valores crudos de los P* con su interruptor (solo admin)
--   property_services   estado por servicio (P) + evidencia (I)
--   property_documents  checklist documental (solo admin)
--   public_properties   vista: lo único que debe leer el sitio público
-- RLS filtra filas, no columnas: por eso nada interno puede ir en properties.

-- ---------------------------------------------------------------------------
-- 1. properties: campos públicos nuevos
-- ---------------------------------------------------------------------------
ALTER TABLE public.properties
  ADD COLUMN code text,
  ADD COLUMN arrival_reference text,
  ADD COLUMN distances text,
  ADD COLUMN access_status text
    CHECK (access_status IN ('pavimentado', 'terraceria', 'otro', 'por_confirmar')),
  ADD COLUMN area_m2 numeric(12, 2) CHECK (area_m2 > 0),
  ADD COLUMN frontage_m numeric(8, 2) CHECK (frontage_m > 0),
  ADD COLUMN depth_m numeric(8, 2) CHECK (depth_m > 0),
  ADD COLUMN measures_note text,
  ADD COLUMN lot_type text[] NOT NULL DEFAULT '{}'
    CHECK (lot_type <@ ARRAY['esquina', 'intermedio', 'frente_al_mar', 'vista_al_mar']::text[]),
  ADD COLUMN topography text,
  ADD COLUMN differentiators text[] NOT NULL DEFAULT '{}'
    CHECK (cardinality(differentiators) <= 3),
  ADD COLUMN cta text,
  ADD COLUMN video_url text;

-- Estado "apartada" visible con sello
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_status_check
  CHECK (status IN ('active', 'inactive', 'reserved', 'sold'));

-- ---------------------------------------------------------------------------
-- 2. Tablas internas
-- ---------------------------------------------------------------------------
CREATE TABLE public.property_records (
  property_id uuid PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,

  -- A. Identificación
  workflow_status text NOT NULL DEFAULT 'borrador' CHECK (workflow_status IN (
    'borrador', 'en_validacion', 'listo', 'publicada', 'apartada', 'vendida', 'pausada', 'retirada'
  )),
  owner_name text,
  owner_contact text,
  contract_type text CHECK (contract_type IN ('exclusiva', 'abierta')),
  contract_valid_until date,

  -- B. Ubicación (P* con interruptor)
  maps_url text,
  publish_exact_location boolean NOT NULL DEFAULT false,

  -- C. Superficie
  deed_area_m2 numeric(12, 2),
  real_area_m2 numeric(12, 2),
  measures_differ boolean,
  measures_diff_note text,
  land_use text,
  land_use_confirmed boolean NOT NULL DEFAULT false,

  -- D. Precio y condiciones (el financiamiento hereda la moneda del precio)
  down_payment numeric(15, 2),
  term_months integer CHECK (term_months > 0),
  monthly_payment numeric(15, 2),
  interest_and_fees text,
  financing_confirmed boolean NOT NULL DEFAULT false,
  payment_requirements text,
  publish_payment_requirements boolean NOT NULL DEFAULT false,
  buyer_costs text,
  buyer_costs_status text NOT NULL DEFAULT 'por_confirmar'
    CHECK (buyer_costs_status IN ('confirmado', 'por_confirmar')),
  publish_buyer_costs boolean NOT NULL DEFAULT false,
  price_valid_until date,
  price_verified_at date,

  -- F. Situación documental
  tenure_type text CHECK (tenure_type IN (
    'privada', 'ejidal', 'comunal', 'fideicomiso', 'otra', 'por_confirmar'
  )),
  publish_tenure boolean NOT NULL DEFAULT false,
  open_alerts text,
  docs_reviewed_by text,
  docs_reviewed_at date,

  -- G. Posicionamiento
  buyer_profile text,
  unpublished_notes text,

  -- H. Material
  photos_taken_at date,
  drive_url text,

  -- I. Verificación
  last_verified_at date,
  last_verified_via text,
  verified_by text,
  approved_by text,
  approved_at date,
  ficha_version integer NOT NULL DEFAULT 1,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.property_services (
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  service text NOT NULL CHECK (service IN (
    'agua', 'electricidad', 'drenaje', 'alumbrado_publico', 'calle_pavimentada', 'internet', 'gas'
  )),
  status text NOT NULL DEFAULT 'por_confirmar'
    CHECK (status IN ('instalado_en_lote', 'en_la_zona', 'no_hay', 'por_confirmar')),
  evidence_note text,
  PRIMARY KEY (property_id, service),
  -- Sin evidencia no se puede marcar como instalado
  CONSTRAINT installed_requires_evidence
    CHECK (status <> 'instalado_en_lote' OR coalesce(btrim(evidence_note), '') <> '')
);

CREATE TABLE public.property_documents (
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  doc_type text NOT NULL CHECK (doc_type IN (
    'escritura', 'libertad_gravamen', 'predial', 'identificacion_poderes', 'plano',
    'uso_suelo', 'evidencia_servicios', 'contrato_firmado', 'aprobacion_precio'
  )),
  received boolean NOT NULL DEFAULT false,
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_at date,
  note text,
  PRIMARY KEY (property_id, doc_type)
);

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value) VALUES
  ('publish_max_verification_days', '15'),
  ('publish_min_photos', '{"casa": 12, "oficina": 12, "lote": 12, "inversion": 12}');

-- RLS: todo lo interno es solo para admins
ALTER TABLE public.property_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage property records" ON public.property_records
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage property services" ON public.property_services
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage property documents" ON public.property_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage app settings" ON public.app_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Defensa extra: anon no tiene ningún privilegio sobre las tablas internas
REVOKE ALL ON public.property_records, public.property_services,
  public.property_documents, public.app_settings FROM anon;

-- ---------------------------------------------------------------------------
-- 3. Folio por tipo: LB-C### casa, LB-O### oficina, LB-T### lote, LB-I### inversión
--    Una secuencia por tipo; el folio nunca se reutiliza ni cambia.
-- ---------------------------------------------------------------------------
CREATE SEQUENCE public.property_code_casa_seq;
CREATE SEQUENCE public.property_code_oficina_seq;
CREATE SEQUENCE public.property_code_lote_seq;
CREATE SEQUENCE public.property_code_inversion_seq;

-- Backfill de folios para las propiedades existentes, por antigüedad
WITH numbered AS (
  SELECT id, type, row_number() OVER (PARTITION BY type ORDER BY created_at, id) AS n
  FROM public.properties
)
UPDATE public.properties p
SET code = CASE n.type
    WHEN 'casa' THEN 'LB-C' WHEN 'oficina' THEN 'LB-O'
    WHEN 'lote' THEN 'LB-T' ELSE 'LB-I'
  END || lpad(n.n::text, 3, '0')
FROM numbered n
WHERE n.id = p.id;

SELECT setval('public.property_code_casa_seq',
  greatest((SELECT count(*) FROM public.properties WHERE type = 'casa'), 1),
  (SELECT count(*) FROM public.properties WHERE type = 'casa') > 0);
SELECT setval('public.property_code_oficina_seq',
  greatest((SELECT count(*) FROM public.properties WHERE type = 'oficina'), 1),
  (SELECT count(*) FROM public.properties WHERE type = 'oficina') > 0);
SELECT setval('public.property_code_lote_seq',
  greatest((SELECT count(*) FROM public.properties WHERE type = 'lote'), 1),
  (SELECT count(*) FROM public.properties WHERE type = 'lote') > 0);
SELECT setval('public.property_code_inversion_seq',
  greatest((SELECT count(*) FROM public.properties WHERE type = 'inversion'), 1),
  (SELECT count(*) FROM public.properties WHERE type = 'inversion') > 0);

ALTER TABLE public.properties
  ALTER COLUMN code SET NOT NULL,
  ADD CONSTRAINT properties_code_key UNIQUE (code);

-- Backfill de m² cuando area es solo un número ("187", "187 m2", "250 m²")
UPDATE public.properties
SET area_m2 = substring(area FROM '^\s*([0-9]+(?:\.[0-9]+)?)')::numeric
WHERE area ~* '^\s*[0-9]+(\.[0-9]+)?\s*(m2|m²|mts?)?\s*$';

-- Backfill de fichas: las publicadas se respetan como están (el candado solo
-- actúa al volver a publicar). Va antes de crear los triggers.
INSERT INTO public.property_records (property_id, workflow_status)
SELECT id, CASE status
    WHEN 'active' THEN 'publicada'
    WHEN 'sold' THEN 'vendida'
    ELSE 'pausada'
  END
FROM public.properties;

-- ---------------------------------------------------------------------------
-- 4. Triggers
-- ---------------------------------------------------------------------------

-- Folio al insertar
CREATE OR REPLACE FUNCTION public.assign_property_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := CASE NEW.type
      WHEN 'casa' THEN 'LB-C' || lpad(nextval('public.property_code_casa_seq')::text, 3, '0')
      WHEN 'oficina' THEN 'LB-O' || lpad(nextval('public.property_code_oficina_seq')::text, 3, '0')
      WHEN 'lote' THEN 'LB-T' || lpad(nextval('public.property_code_lote_seq')::text, 3, '0')
      ELSE 'LB-I' || lpad(nextval('public.property_code_inversion_seq')::text, 3, '0')
    END;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_property_code
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.assign_property_code();

-- El folio no se puede editar
CREATE OR REPLACE FUNCTION public.protect_property_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.code IS DISTINCT FROM OLD.code THEN
    RAISE EXCEPTION 'El folio % no se puede modificar', OLD.code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_property_code
  BEFORE UPDATE OF code ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.protect_property_code();

-- status solo lo cambia la sincronización desde workflow_status.
-- Una propiedad nueva siempre nace oculta.
CREATE OR REPLACE FUNCTION public.guard_property_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(current_setting('app.status_sync', true), '') <> 'on' THEN
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'inactive';
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'El estado de publicación se cambia desde el flujo de la ficha (workflow_status)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_property_status
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_status();

-- Cada propiedad nueva tiene su ficha interna
CREATE OR REPLACE FUNCTION public.create_property_record()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.property_records (property_id) VALUES (NEW.id)
  ON CONFLICT (property_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_property_record
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.create_property_record();

-- Candado "Listo para publicar". Recibe las filas para poder evaluar los
-- valores nuevos dentro del trigger (antes de que se guarden).
CREATE OR REPLACE FUNCTION public.evaluate_publish_blockers(p public.properties, r public.property_records)
RETURNS text[] LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  blockers text[] := '{}';
  max_days integer;
  min_photos integer;
  is_land boolean := p.type IN ('lote', 'inversion');
BEGIN
  SELECT (value)::text::integer INTO max_days
  FROM public.app_settings WHERE key = 'publish_max_verification_days';
  SELECT (value ->> p.type)::integer INTO min_photos
  FROM public.app_settings WHERE key = 'publish_min_photos';
  max_days := coalesce(max_days, 15);
  min_photos := coalesce(min_photos, 12);

  -- 1. Contrato registrado y vigente
  IF r.contract_type IS NULL OR r.contract_valid_until IS NULL THEN
    blockers := array_append(blockers, 'Falta registrar el contrato (tipo y vigencia)');
  ELSIF r.contract_valid_until < current_date THEN
    blockers := array_append(blockers, 'El contrato está vencido');
  END IF;

  -- 2. Precio, moneda y fecha de verificación del precio
  IF p.price IS NULL OR p.price <= 0 OR p.currency IS NULL THEN
    blockers := array_append(blockers, 'Falta el precio o la moneda');
  END IF;
  IF r.price_verified_at IS NULL THEN
    blockers := array_append(blockers, 'Falta la fecha de verificación del precio');
  END IF;

  -- 3. Checklist documental revisado y sin alertas
  IF r.docs_reviewed_by IS NULL OR r.docs_reviewed_at IS NULL THEN
    blockers := array_append(blockers, 'El checklist documental no está revisado');
  END IF;
  IF coalesce(btrim(r.open_alerts), '') <> '' THEN
    blockers := array_append(blockers, 'Hay alertas documentales abiertas');
  END IF;

  -- 4. Obligatorios de A, B, C y D
  IF coalesce(btrim(p.title), '') = '' THEN
    blockers := array_append(blockers, 'Falta el nombre comercial');
  END IF;
  IF coalesce(btrim(p.location), '') = '' THEN
    blockers := array_append(blockers, 'Falta la zona y municipio');
  END IF;
  IF coalesce(btrim(p.arrival_reference), '') = '' THEN
    blockers := array_append(blockers, 'Falta la referencia de llegada');
  END IF;
  IF p.access_status IS NULL THEN
    blockers := array_append(blockers, 'Falta el estado del acceso');
  END IF;
  IF p.area_m2 IS NULL THEN
    blockers := array_append(blockers, 'Falta la superficie en m²');
  END IF;
  IF is_land AND (p.frontage_m IS NULL OR p.depth_m IS NULL) THEN
    blockers := array_append(blockers, 'Faltan las medidas de frente y fondo');
  END IF;
  IF is_land AND coalesce(btrim(p.topography), '') = '' THEN
    blockers := array_append(blockers, 'Falta la topografía');
  END IF;

  -- 5. Fotos mínimas por tipo
  IF cardinality(p.images) < min_photos THEN
    blockers := array_append(blockers, format('Tiene %s fotos; se necesitan al menos %s',
      cardinality(p.images), min_photos));
  END IF;

  -- 6. Aprobación del responsable
  IF coalesce(btrim(r.approved_by), '') = '' OR r.approved_at IS NULL THEN
    blockers := array_append(blockers, 'Falta la aprobación del responsable (nombre y fecha)');
  END IF;

  -- 7. Verificación reciente
  IF r.last_verified_at IS NULL THEN
    blockers := array_append(blockers, 'Falta la fecha de última verificación con el propietario');
  ELSIF r.last_verified_at < current_date - max_days THEN
    blockers := array_append(blockers, format('La última verificación tiene más de %s días', max_days));
  END IF;

  RETURN blockers;
END;
$$;

-- Para el panel "qué falta" del admin: misma regla que el trigger
CREATE OR REPLACE FUNCTION public.publish_blockers(p_property_id uuid)
RETURNS text[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.properties;
  r public.property_records;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo administradores';
  END IF;
  SELECT * INTO p FROM public.properties WHERE id = p_property_id;
  SELECT * INTO r FROM public.property_records WHERE property_id = p_property_id;
  IF p.id IS NULL OR r.property_id IS NULL THEN
    RAISE EXCEPTION 'Propiedad no encontrada';
  END IF;
  RETURN public.evaluate_publish_blockers(p, r);
END;
$$;

REVOKE ALL ON FUNCTION public.publish_blockers(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_blockers(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.evaluate_publish_blockers(public.properties, public.property_records) FROM PUBLIC, anon;

-- Transiciones de workflow + versión de la ficha
CREATE OR REPLACE FUNCTION public.check_workflow_transition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.properties;
  blockers text[];
  previous text := CASE WHEN TG_OP = 'UPDATE' THEN OLD.workflow_status END;
BEGIN
  IF NEW.workflow_status = 'publicada' AND previous IS DISTINCT FROM 'publicada' THEN
    SELECT * INTO p FROM public.properties WHERE id = NEW.property_id;
    blockers := public.evaluate_publish_blockers(p, NEW);
    IF cardinality(blockers) > 0 THEN
      RAISE EXCEPTION 'No se puede publicar: %', array_to_string(blockers, '; ')
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF NEW.workflow_status = 'apartada' AND previous IS DISTINCT FROM 'apartada'
     AND previous IS DISTINCT FROM 'publicada' THEN
    RAISE EXCEPTION 'Solo una propiedad publicada se puede marcar como apartada';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.ficha_version := OLD.ficha_version + 1;
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_workflow_transition
  BEFORE INSERT OR UPDATE ON public.property_records
  FOR EACH ROW EXECUTE FUNCTION public.check_workflow_transition();

-- workflow_status manda: sincroniza properties.status
CREATE OR REPLACE FUNCTION public.sync_property_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM set_config('app.status_sync', 'on', true);
  UPDATE public.properties
  SET status = CASE NEW.workflow_status
      WHEN 'publicada' THEN 'active'
      WHEN 'apartada' THEN 'reserved'
      WHEN 'vendida' THEN 'sold'
      ELSE 'inactive'
    END
  WHERE id = NEW.property_id;
  PERFORM set_config('app.status_sync', 'off', true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_property_status
  AFTER INSERT OR UPDATE OF workflow_status ON public.property_records
  FOR EACH ROW EXECUTE FUNCTION public.sync_property_status();

-- updated_at en las tablas nuevas (función existente)
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 5. Vista pública: P + P* activados. Corre con privilegios del dueño
--    (security definer, intencional) y expone solo columnas explícitas.
-- ---------------------------------------------------------------------------
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
  ) AS services
FROM public.properties p
LEFT JOIN public.property_records r ON r.property_id = p.id
WHERE p.status IN ('active', 'reserved', 'sold');

REVOKE ALL ON public.public_properties FROM PUBLIC;
GRANT SELECT ON public.public_properties TO anon, authenticated;
