# Baja Investment Hub

Sitio web inmobiliario de **Heredia Land Baja** con CRM interno para propiedades y prospectos.
React + Vite + Tailwind + shadcn/ui, con Supabase como backend.

La documentación completa (arquitectura, base de datos, rutas, flujo de leads) está en [PROYECTO.md](PROYECTO.md).

## Inicio rápido

```sh
cp .env.example .env   # y completar con los datos del proyecto de Supabase
npm install
npm run dev            # http://localhost:8080
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm test` | Tests con Vitest |

## Datos de contacto

Teléfono, WhatsApp, email, dirección y redes sociales se configuran en un único lugar:
[src/config/site.ts](src/config/site.ts).

## Base de datos

Las migraciones están en `supabase/migrations/`. Para aplicarlas:

```sh
supabase link --project-ref <project-id>
supabase db push
```

Para dar acceso de administrador a un usuario de Supabase Auth:

```sql
INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid-del-usuario>', 'admin');
```

## Despliegue

Es una SPA estática. Hosting principal: **Cloudflare Workers** ([wrangler.jsonc](wrangler.jsonc), con `not_found_handling: single-page-application`). También funciona en Netlify ([netlify.toml](netlify.toml)).
Las variables `VITE_SUPABASE_*` deben configurarse en el proveedor de hosting, porque `.env` no se sube al repositorio.
