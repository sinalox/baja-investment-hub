-- Simulación mínima de Supabase para probar las migraciones en un Postgres
-- local (lo usa src/test/db/ficha.db.test.ts). No se aplica en producción.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END $$;

CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY);
-- auth.uid() lee el "usuario" de una variable de sesión
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;

CREATE SCHEMA storage;
CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
CREATE TABLE storage.objects (id uuid DEFAULT gen_random_uuid(), bucket_id text, name text);

-- Como Supabase: privilegios amplios por defecto; la seguridad la pone RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
