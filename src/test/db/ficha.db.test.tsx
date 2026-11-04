// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { PUBLIC_PROPERTY_COLUMNS, type PublicProperty } from '@/lib/publicApi';
import FichaClientePdf from '@/lib/pdf/FichaClientePdf';
import FichaInternaPdf from '@/lib/pdf/FichaInternaPdf';
import { extractPdfText } from '../pdfText';
import { hasPostgres, startLocalDb, type LocalDb } from './localPostgres';

// Pruebas contra las migraciones reales en un Postgres temporal: candado de
// publicación, RLS, vista pública y que el PDF cliente no contenga datos
// internos. Se saltan si la máquina no tiene Postgres (initdb/pg_ctl/psql).

const CASA = '11111111-1111-1111-1111-111111111111';
const LOTE = '22222222-2222-2222-2222-222222222222';

// Casa publicada antes de la ficha (igual que la de producción)
const SEED = `
  INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-00000000000a');
  INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000000a', 'admin');
  INSERT INTO public.properties (id, title, type, category, location, price, currency, area, status, images, image_url, beds, baths)
  VALUES ('${CASA}', 'CASA URBI', 'casa', 'casa', 'Tijuana', 4450000, 'MXN', '187', 'active',
    ARRAY['a.jpg','b.jpg','c.jpg','d.jpg','e.jpg','f.jpg'], 'a.jpg', 3, 3);
`;

// Valores internos con marcas únicas para buscarlas en el PDF
const SECRETS = {
  owner: 'PROPIETARIO-SECRETO-QX7',
  contact: 'CONTACTO-SECRETO-QX7',
  notes: 'NOTA-INTERNA-QX7',
  alerts: 'ALERTA-QX7',
  drive: 'https://drive.google.com/SECRETO-QX7',
  evidence: 'EVIDENCIA-QX7',
  maps: 'https://maps.example.com/PIN-QX7',
  buyerProfile: 'PERFIL-QX7',
  docNote: 'DOCNOTA-QX7',
};

const PUBLISH = `UPDATE property_records SET workflow_status = 'publicada' WHERE property_id = '${LOTE}'`;
const blockers = (db: LocalDb) => db.json<string[]>(`SELECT to_json(publish_blockers('${LOTE}'))`, 'admin');

describe.skipIf(!hasPostgres)('ficha técnica en Postgres (migraciones reales)', () => {
  let db: LocalDb;

  beforeAll(() => {
    db = startLocalDb(SEED);
    db.sql(`INSERT INTO properties (id, title, type, category, location, price, currency, area)
      VALUES ('${LOTE}', 'Lote Vista Mar', 'lote', 'lote', 'Rosarito', 90000, 'USD', '300')`, 'admin');
  }, 120_000);

  afterAll(() => db?.stop());

  describe('candado de publicación', () => {
    it('lista exactamente los motivos que faltan en una ficha vacía', () => {
      expect(blockers(db)).toEqual([
        'Falta registrar el contrato (tipo y vigencia)',
        'Falta la fecha de verificación del precio',
        'El checklist documental no está revisado',
        'Falta la referencia de llegada',
        'Falta el estado del acceso',
        'Falta la superficie en m²',
        'Faltan las medidas de frente y fondo',
        'Falta la topografía',
        'Tiene 0 fotos; se necesitan al menos 12',
        'Falta la aprobación del responsable (nombre y fecha)',
        'Falta la fecha de última verificación con el propietario',
      ]);
    });

    it('impide publicar desde la base aunque no se use la UI', () => {
      expect(db.error(PUBLISH, 'admin')).toMatch(/No se puede publicar: Falta registrar el contrato/);
      expect(db.sql(`SELECT status FROM properties WHERE id = '${LOTE}'`)).toBe('inactive');
    });

    it('no deja cambiar el estado directo ni editar el folio', () => {
      expect(db.error(`UPDATE properties SET status = 'active' WHERE id = '${LOTE}'`, 'admin')).toMatch(/flujo de la ficha/);
      expect(db.error(`UPDATE properties SET code = 'X' WHERE id = '${LOTE}'`, 'admin')).toMatch(/no se puede modificar/);
    });

    it('asigna folio por tipo y respeta la casa publicada previa', () => {
      expect(db.sql(`SELECT code FROM properties WHERE id = '${CASA}'`)).toBe('LB-C001');
      expect(db.sql(`SELECT code FROM properties WHERE id = '${LOTE}'`)).toBe('LB-T001');
      expect(db.sql(`SELECT status FROM properties WHERE id = '${CASA}'`)).toBe('active');
    });

    it('publica cuando la ficha cumple todo, con datos internos y P* cargados', () => {
      db.sql(`UPDATE properties SET arrival_reference = 'Km 30', access_status = 'pavimentado', area_m2 = 300,
        frontage_m = 12, depth_m = 25, topography = 'Plano', images = array_fill('x.webp'::text, ARRAY[12]),
        differentiators = ARRAY['Vista al mar'] WHERE id = '${LOTE}'`, 'admin');
      db.sql(`UPDATE property_records SET contract_type = 'exclusiva', contract_valid_until = current_date + 90,
        price_verified_at = current_date, docs_reviewed_by = 'Lic. X', docs_reviewed_at = current_date,
        approved_by = 'I. Heredia', approved_at = current_date, last_verified_at = current_date,
        owner_name = '${SECRETS.owner}', owner_contact = '${SECRETS.contact}', unpublished_notes = '${SECRETS.notes}',
        drive_url = '${SECRETS.drive}', buyer_profile = '${SECRETS.buyerProfile}', maps_url = '${SECRETS.maps}',
        land_use = 'Habitacional', down_payment = 10000, monthly_payment = 2000, term_months = 40,
        tenure_type = 'ejidal', buyer_costs = 'Escrituración', buyer_costs_status = 'confirmado'
        WHERE property_id = '${LOTE}'`, 'admin');
      db.sql(`INSERT INTO property_services VALUES ('${LOTE}', 'agua', 'instalado_en_lote', '${SECRETS.evidence}')`, 'admin');
      db.sql(`INSERT INTO property_documents (property_id, doc_type, received, reviewed, note)
        VALUES ('${LOTE}', 'escritura', true, true, '${SECRETS.docNote}')`, 'admin');

      expect(blockers(db)).toEqual([]);
      db.sql(PUBLISH, 'admin');
      expect(db.sql(`SELECT status FROM properties WHERE id = '${LOTE}'`)).toBe('active');
    });

    it('bloquea si la verificación tiene más de 15 días y "apartada" solo desde publicada', () => {
      db.sql(`UPDATE property_records SET workflow_status = 'pausada', last_verified_at = current_date - 20 WHERE property_id = '${LOTE}'`, 'admin');
      expect(db.error(PUBLISH, 'admin')).toMatch(/más de 15 días/);
      expect(db.error(`UPDATE property_records SET workflow_status = 'apartada' WHERE property_id = '${LOTE}'`, 'admin'))
        .toMatch(/Solo una propiedad publicada/);
      db.sql(`UPDATE property_records SET last_verified_at = current_date WHERE property_id = '${LOTE}'; ${PUBLISH}`, 'admin');
    });
  });

  describe('reglas de servicios, ubicación y financiamiento', () => {
    it('rechaza "instalado en el lote" sin evidencia', () => {
      expect(db.error(`INSERT INTO property_services VALUES ('${LOTE}', 'drenaje', 'instalado_en_lote', '  ')`, 'admin'))
        .toMatch(/installed_requires_evidence/);
    });

    it('oculta ubicación exacta, uso de suelo, financiamiento, gastos y tenencia hasta activar su interruptor', () => {
      const row = db.json<PublicProperty>(`SELECT row_to_json(v) FROM public_properties v WHERE id = '${LOTE}'`, 'anon');
      expect(row.maps_url).toBeNull();
      expect(row.land_use).toBeNull();
      expect(row.down_payment).toBeNull();
      expect(row.monthly_payment).toBeNull();
      expect(row.buyer_costs).toBeNull();
      expect(row.tenure_type).toBeNull();
      expect(row.services).toEqual({ agua: 'instalado_en_lote' }); // estado sí, evidencia no
    });

    it('publica cada P* solo al activar su interruptor', () => {
      db.sql(`UPDATE property_records SET publish_exact_location = true, financing_confirmed = true
        WHERE property_id = '${LOTE}'`, 'admin');
      const row = db.json<PublicProperty>(`SELECT row_to_json(v) FROM public_properties v WHERE id = '${LOTE}'`, 'anon');
      expect(row.maps_url).toBe(SECRETS.maps);
      expect(row.down_payment).toBe(10000);
      expect(row.monthly_payment).toBe(2000);
      expect(row.land_use).toBeNull(); // sigue apagado
      expect(row.tenure_type).toBeNull();
    });

    it('muestra "por confirmar" de gastos solo con el interruptor activo', () => {
      db.sql(`UPDATE property_records SET publish_buyer_costs = true, buyer_costs_status = 'por_confirmar'
        WHERE property_id = '${LOTE}'`, 'admin');
      const row = db.json<PublicProperty>(`SELECT row_to_json(v) FROM public_properties v WHERE id = '${LOTE}'`, 'anon');
      expect(row.buyer_costs_status).toBe('por_confirmar');
      expect(row.buyer_costs).toBeNull(); // el texto no sale mientras esté por confirmar
    });
  });

  describe('seguridad: acceso anónimo', () => {
    it.each(['property_records', 'property_services', 'property_documents', 'app_settings'])(
      'anon no puede leer %s',
      (table) => {
        expect(db.error(`SELECT * FROM ${table}`, 'anon')).toMatch(/permission denied/);
      },
    );

    it('anon no puede llamar al candado', () => {
      expect(db.error(`SELECT publish_blockers('${LOTE}')`, 'anon')).toMatch(/permission denied/);
    });

    it('anon no puede pedir columnas internas a la vista', () => {
      for (const column of ['owner_name', 'drive_url', 'open_alerts', 'evidence_note', 'workflow_status', 'created_at']) {
        expect(db.error(`SELECT ${column} FROM public_properties`, 'anon')).toMatch(/does not exist/);
      }
    });

    it('la vista expone exactamente las columnas de PUBLIC_PROPERTY_COLUMNS', () => {
      const columns = db.json<string[]>(`SELECT json_agg(column_name ORDER BY column_name)
        FROM information_schema.columns WHERE table_name = 'public_properties'`);
      expect(columns).toEqual([...PUBLIC_PROPERTY_COLUMNS].sort());
    });

    it('ningún dato interno aparece en la vista aunque esté cargado', () => {
      const raw = db.sql(`SELECT row_to_json(v) FROM public_properties v WHERE id = '${LOTE}'`, 'anon');
      for (const secret of [SECRETS.owner, SECRETS.contact, SECRETS.notes, SECRETS.drive, SECRETS.evidence,
        SECRETS.buyerProfile, SECRETS.docNote]) {
        expect(raw).not.toContain(secret);
      }
    });

    it('tras la migración 1b, anon ya no lee la tabla properties pero sí la vista', () => {
      // La 1b ya está aplicada (startLocalDb aplica todas las migraciones)
      expect(db.error('SELECT * FROM properties', 'anon')).toMatch(/permission denied/);
      expect(db.sql('SELECT count(*) FROM public_properties', 'anon')).toBe('2');
    });
  });

  describe('PDF', () => {
    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    it('la ficha cliente no contiene ningún dato interno', async () => {
      const property = db.json<PublicProperty>(`SELECT row_to_json(v) FROM public_properties v WHERE id = '${LOTE}'`, 'anon');
      const pdf = await renderToBuffer(
        <FichaClientePdf property={property} photos={[]} qr={tinyPng} url="https://example.com/p" />,
      );
      const text = extractPdfText(pdf);
      expect(text).toContain('Lote Vista Mar'); // el extractor funciona
      expect(text).toContain('LB-T001');
      for (const secret of Object.values(SECRETS).filter((s) => s !== SECRETS.maps)) {
        expect(text).not.toContain(secret);
      }
      for (const label of ['USO INTERNO', 'Propietario', 'Contrato', 'Carpeta de Drive', 'Alertas', 'Escritura vs', 'no publicado']) {
        expect(text).not.toContain(label);
      }
    }, 30_000);

    it('la ficha interna sí los contiene (control del extractor)', async () => {
      const property = db.json(`SELECT row_to_json(p) FROM properties p WHERE id = '${LOTE}'`, 'admin');
      const record = db.json(`SELECT row_to_json(r) FROM property_records r WHERE property_id = '${LOTE}'`, 'admin');
      const services = db.json(`SELECT coalesce(json_agg(s), '[]') FROM property_services s WHERE property_id = '${LOTE}'`, 'admin');
      const documents = db.json(`SELECT coalesce(json_agg(d), '[]') FROM property_documents d WHERE property_id = '${LOTE}'`, 'admin');
      const pdf = await renderToBuffer(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <FichaInternaPdf property={property as any} record={record as any} services={services as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          documents={documents as any} generatedAt="29/10/2026" />,
      );
      const text = extractPdfText(pdf);
      expect(text).toContain(SECRETS.owner);
      expect(text).toContain(SECRETS.notes);
      expect(text).toContain(SECRETS.evidence);
      expect(text).toContain('USO INTERNO');
    }, 30_000);
  });
});

// Reproduce el estado detectado en producción el 2026-10-29 (RLS apagada y
// política abierta creada a mano) y comprueba que la migración de seguridad
// lo corrige sin romper el sitio ni el admin.
describe.skipIf(!hasPostgres)('corrección de seguridad (20261029120000_security_hardening)', () => {
  let db: LocalDb;
  const anonInsert = `INSERT INTO properties (title, type, category, location, price, area) VALUES ('x', 'casa', 'casa', 'x', 1, '1')`;

  beforeAll(() => {
    db = startLocalDb(SEED);
    // Deriva de producción
    db.sql(`ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
      ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE properties ADD COLUMN address text;
      -- En producción la 1b aún no está aplicada: anon conserva SELECT en properties
      GRANT SELECT, INSERT, UPDATE, DELETE ON properties, user_roles TO anon;
      CREATE POLICY "Enable all access" ON leads FOR ALL USING (true) WITH CHECK (true);`);
  }, 120_000);

  afterAll(() => db?.stop());

  it('reproduce el problema: anon escribe en properties, lee user_roles y leads', () => {
    expect(db.error(anonInsert, 'anon')).toBeNull();
    expect(db.error(`UPDATE properties SET price = 1 WHERE id = '${CASA}'`, 'anon')).toBeNull();
    expect(db.sql('SELECT count(*) FROM user_roles', 'anon')).toBe('1');
    expect(db.error(`INSERT INTO user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000000a', 'user')`, 'anon')).toBeNull();
  });

  it('después de la corrección anon no puede escribir ni ver roles', () => {
    db.applyMigration('20261029120000_security_hardening.sql');
    expect(db.error(anonInsert, 'anon')).toMatch(/permission denied/);
    expect(db.error(`UPDATE properties SET price = 2 WHERE id = '${CASA}'`, 'anon')).toMatch(/permission denied/);
    expect(db.error(`DELETE FROM properties`, 'anon')).toMatch(/permission denied/);
    expect(db.error(`INSERT INTO user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000000a', 'admin')`, 'anon'))
      .toMatch(/permission denied/);
    expect(db.sql('SELECT count(*) FROM user_roles', 'anon')).toBe('0');
    expect(db.sql('SELECT count(*) FROM leads', 'anon')).toBe('0');
    expect(db.sql(`SELECT count(*) FROM pg_policies WHERE policyname = 'Enable all access'`)).toBe('0');
  });

  it('el sitio público y el admin siguen funcionando', () => {
    expect(db.sql('SELECT count(*) FROM public_properties', 'anon')).toBe('1');
    expect(db.error(`INSERT INTO leads (name, phone, property_type, status, source)
      VALUES ('Ana', '664', 'casa', 'nuevo', 'formulario_web')`, 'anon')).toBeNull();
    expect(db.sql('SELECT count(*) FROM leads', 'admin')).toBe('1');
    expect(db.sql(`SELECT role FROM user_roles WHERE user_id = '00000000-0000-0000-0000-00000000000a' AND role = 'admin'`, 'admin')).toBe('admin');
    expect(db.error(`UPDATE properties SET price = 4500000 WHERE id = '${CASA}'`, 'admin')).toBeNull();
  });

  it('es idempotente (se puede aplicar dos veces)', () => {
    expect(() => db.applyMigration('20261029120000_security_hardening.sql')).not.toThrow();
  });
});

// Reproduce lo ocurrido el 2026-10-29: la base de producción tenía políticas
// con otros nombres; la corrección las borró (web sin propiedades, admin sin
// acceso) y 20261029130000_restore_policies las vuelve a crear.
describe.skipIf(!hasPostgres)('restauración de políticas (20261029130000_restore_policies)', () => {
  let db: LocalDb;
  const policies = (table: string) =>
    db.json<string[]>(`SELECT coalesce(json_agg(policyname ORDER BY policyname), '[]') FROM pg_policies WHERE tablename = '${table}'`);

  beforeAll(() => {
    db = startLocalDb(SEED);
    // Estado de producción antes de la 1b: anon aún lee la tabla properties
    db.sql('GRANT SELECT ON properties TO anon');
    // Políticas de producción con nombres distintos a los de las migraciones
    db.sql(`DROP POLICY "Anyone can view active properties" ON properties;
      DROP POLICY "Users can view their own roles" ON user_roles;
      DROP POLICY "Admins can view leads" ON leads;
      CREATE POLICY "Public read active" ON properties FOR SELECT USING (status = 'active');
      CREATE POLICY "Read own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Admin read leads" ON leads FOR SELECT USING (has_role(auth.uid(), 'admin'));`);
    db.applyMigration('20261029120000_security_hardening.sql');
  }, 120_000);

  afterAll(() => db?.stop());

  it('reproduce el problema: la web y el admin pierden acceso', () => {
    expect(db.sql(`SELECT count(*) FROM properties WHERE status = 'active'`, 'anon')).toBe('0');
    expect(db.sql('SELECT count(*) FROM user_roles', 'admin')).toBe('0'); // el login no reconoce al admin
    expect(db.sql('SELECT count(*) FROM leads', 'admin')).toBe('0');
  });

  it('la restauración devuelve la lectura pública y el acceso del admin', () => {
    db.sql(`INSERT INTO leads (name, phone, property_type, status, source) VALUES ('Ana', '664', 'casa', 'nuevo', 'formulario_web')`);
    db.applyMigration('20261029130000_restore_policies.sql');
    expect(db.sql(`SELECT count(*) FROM properties WHERE status = 'active'`, 'anon')).toBe('1');
    expect(db.sql(`SELECT count(*) FROM properties WHERE status <> 'active'`, 'anon')).toBe('0');
    expect(db.sql('SELECT role FROM user_roles', 'admin')).toBe('admin');
    expect(db.sql('SELECT count(*) FROM leads', 'admin')).toBe('1');
    expect(db.sql('SELECT count(*) FROM user_roles', 'anon')).toBe('0');
    expect(db.error(`UPDATE properties SET price = 1 WHERE id = '${CASA}'`, 'anon')).toMatch(/permission denied/);
    expect(db.error(`UPDATE properties SET price = 4500000 WHERE id = '${CASA}'`, 'admin')).toBeNull();
  });

  it('deja exactamente las políticas esperadas', () => {
    expect(policies('properties')).toEqual([
      'Admins can delete properties', 'Admins can insert properties', 'Admins can update properties',
      'Admins can view all properties', 'Anyone can view active properties',
    ]);
    expect(policies('user_roles')).toEqual(['Users can view their own roles']);
    expect(policies('leads')).toEqual([
      'Admins can delete leads', 'Admins can insert leads', 'Admins can update leads', 'Admins can view leads',
      'Public can insert leads',
    ]);
  });

  it('es idempotente', () => {
    expect(() => db.applyMigration('20261029130000_restore_policies.sql')).not.toThrow();
  });
});
