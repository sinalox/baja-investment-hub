import { execFileSync, execSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Postgres temporal para probar las migraciones reales (RLS, triggers, vista).
// Solo para tests: crea un cluster en /tmp, aplica supabase/tests/supabase-stub.sql
// y todas las migraciones en orden, y se borra al terminar.

const ROOT = path.resolve(__dirname, '../../..');

export const hasPostgres = (() => {
  try {
    execSync('command -v initdb && command -v pg_ctl && command -v psql', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

export interface LocalDb {
  // Ejecuta SQL como superusuario, anon o admin y devuelve la salida
  sql: (query: string, as?: 'postgres' | 'anon' | 'admin') => string;
  // Igual que sql pero parsea un SELECT ... json
  json: <T = unknown>(query: string, as?: 'postgres' | 'anon' | 'admin') => T;
  // Devuelve el mensaje de error, o null si no falló
  error: (query: string, as?: 'postgres' | 'anon' | 'admin') => string | null;
  // Vuelve a aplicar una migración (para probar que es idempotente)
  applyMigration: (file: string) => void;
  stop: () => void;
}

export const ADMIN_ID = '00000000-0000-0000-0000-00000000000a';

export const startLocalDb = (seed = ''): LocalDb => {
  const dir = mkdtempSync(path.join(tmpdir(), 'lb-pg-'));
  execFileSync('initdb', ['-D', `${dir}/data`, '-U', 'postgres', '--auth=trust'], { stdio: 'ignore' });

  // Puerto aleatorio con reintentos: varios bloques de tests levantan su
  // propio Postgres y un puerto recién liberado puede seguir ocupado
  let port = '';
  for (let attempt = 1; ; attempt++) {
    port = String(55000 + Math.floor(Math.random() * 4000));
    try {
      execFileSync('pg_ctl', [
        '-D', `${dir}/data`, '-l', `${dir}/log`, '-w',
        '-o', `-p ${port} -c listen_addresses=127.0.0.1 -c unix_socket_directories=''`, 'start',
      ], { stdio: 'ignore' });
      break;
    } catch (e) {
      if (attempt >= 5) {
        rmSync(dir, { recursive: true, force: true });
        throw e;
      }
    }
  }

  const psql = (args: string[]) =>
    execFileSync('psql', ['-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1',
      '-h', '127.0.0.1', '-p', port, '-U', 'postgres', '-d', 'postgres', ...args],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  // Con -c y varios comandos, psql (14) solo imprime el resultado del último
  const roleWrap = (query: string, as: 'postgres' | 'anon' | 'admin') => {
    if (as === 'anon') return `SET ROLE anon; ${query}`;
    if (as === 'admin') {
      return `SET ROLE authenticated; SELECT set_config('request.jwt.claim.sub', '${ADMIN_ID}', false); ${query}`;
    }
    return query;
  };

  const sql: LocalDb['sql'] = (query, as = 'postgres') => psql(['-c', roleWrap(query, as)]).trim();

  const json: LocalDb['json'] = (query, as) => {
    const out = sql(query, as).split('\n').filter(Boolean).pop() ?? 'null';
    return JSON.parse(out);
  };

  const error: LocalDb['error'] = (query, as) => {
    try {
      sql(query, as);
      return null;
    } catch (e) {
      const stderr = String((e as { stderr?: string }).stderr ?? e);
      return stderr.replace(/^psql:[^:]*:\d+: /gm, '').trim();
    }
  };

  const stop = () => {
    try {
      execFileSync('pg_ctl', ['-D', `${dir}/data`, '-m', 'immediate', 'stop'], { stdio: 'ignore' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  try {
    psql(['-f', path.join(ROOT, 'supabase/tests/supabase-stub.sql')]);
    const migrations = readdirSync(path.join(ROOT, 'supabase/migrations')).filter((f) => f.endsWith('.sql')).sort();
    // El seed va justo antes de la ficha técnica, para probar también el backfill
    for (const file of migrations) {
      if (seed && file.startsWith('20261026120000')) psql(['-c', seed]);
      psql(['-f', path.join(ROOT, 'supabase/migrations', file)]);
    }
  } catch (e) {
    stop();
    throw new Error(`No se pudieron aplicar las migraciones: ${String((e as { stderr?: string }).stderr ?? e)}`);
  }

  const applyMigration = (file: string) => {
    psql(['-f', path.join(ROOT, 'supabase/migrations', file)]);
  };

  return { sql, json, error, applyMigration, stop };
};
