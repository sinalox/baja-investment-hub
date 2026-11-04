# CLAUDE.md

Sitio inmobiliario de **Heredia Land Baja** (Tijuana, B.C.) con CRM interno. React 18 + Vite 5 + TypeScript + Tailwind + shadcn/ui, backend en Supabase. Documentación completa para personas: [PROYECTO.md](PROYECTO.md).

- Todo el contenido, la UI, los comentarios y los commits van **en español**.
- La mayoría de las visitas llegan **desde el celular**: cualquier cambio en el sitio público se diseña mobile-first y se revisa a 390 px de ancho, sin scroll horizontal.

## Comandos

```sh
npm run dev      # http://localhost:8080
npm test         # Vitest (src/lib/*.test.ts)
npm run lint     # 0 errores; hay 8 warnings preexistentes de shadcn/useAuth
npm run build    # dist/
npx tsc -p tsconfig.app.json --noEmit   # typecheck
```

Antes de dar algo por terminado: typecheck, lint, tests y build deben pasar.

## Arquitectura (lo que no es obvio)

- **Sitio público sin `supabase-js`.** La landing, `PropertyDetail` y `ContactForm` usan [src/lib/publicApi.ts](src/lib/publicApi.ts), que llama directo a la API REST. No importes `@/integrations/supabase/client` en código público: mete auth, realtime y storage al bundle inicial.
- **Admin aislado.** Todas las rutas `/admin` van con `React.lazy` dentro de [AdminRoot](src/components/admin/AdminRoot.tsx), que provee `AuthProvider`, y de `ProtectedRoute` usado como layout route. `useAuth` solo funciona dentro de `/admin`.
- **Datos de contacto** (teléfono, WhatsApp, email, dirección y redes) solo en [src/config/site.ts](src/config/site.ts). No hardcodear números ni correos en componentes.
- **Leads públicos**: validación zod compartida y honeypot en [src/lib/leads.ts](src/lib/leads.ts). Sus límites deben coincidir con la política RLS `Public can insert leads`; si cambias uno, cambia el otro.
- **Imágenes de propiedades**:
  - Están en `properties.images` (text[]). `images[0]` es la portada y se replica en `image_url`.
  - Usa `getPropertyImages()` para leerlas.
  - Las fotos se comprimen a WebP de 1920 px antes de subirlas ([src/lib/imageCompression.ts](src/lib/imageCompression.ts)).
  - En la galería y las tarjetas se muestran con `object-contain` sobre un fondo desenfocado. No volver a `object-cover`, porque recorta las fotos.
- **Imágenes estáticas** en WebP, con versión `-mobile` servida mediante `<picture>`.
- **`Header`** usa la prop `solid` en páginas sin hero oscuro.
- **[src/integrations/supabase/types.ts](src/integrations/supabase/types.ts)** se genera automáticamente, pero se edita a mano cuando agregamos columnas.

## Base de datos (Supabase)

- Proyecto: `ctosssibhcqhwsjdecxz`.
- Las migraciones van en `supabase/migrations/` con un nombre con fecha. **Las aplica el usuario a mano** en el SQL Editor.
- Si el código depende de una migración nueva, **avisa y espera a que esté aplicada antes de hacer push**, porque el push publica en producción. Para comprobarlo, consulta la API REST con la clave publishable del `.env`.
- RLS:
  - Los visitantes solo ven propiedades `active` y solo pueden insertar leads restringidos.
  - Los admins se verifican con `has_role(auth.uid(), 'admin')`.

## Despliegue

- **Cloudflare Workers**: https://baja-investment-hub.ariashrdi.workers.dev. Cada push a `main` se publica solo.
- [wrangler.jsonc](wrangler.jsonc) sirve `dist/` como SPA con `not_found_handling`. El `name` debe coincidir con el Worker del dashboard.
- **No pongas `/* /index.html 200` en `public/_redirects`**: Cloudflare rechaza el deploy (error 100324). La regla SPA de Netlify vive en [netlify.toml](netlify.toml).
- [public/_headers](public/_headers): caché de un año para `/assets/*`.
- Las variables `VITE_SUPABASE_*` se configuran como **variables de build** en Cloudflare.

## Git

- Se trabaja directo en `main`.
- Haz commit y push solo cuando el usuario lo pida.
- **`.env` nunca va a git**; está en `.gitignore`.

# Reglas del proyecto baja-investment-hub
- Responde y comenta en español. Textos de interfaz en español de México.
- La tabla `properties` es pública: NUNCA agregues columnas con datos del propietario, documentación, notas internas, fuentes o verificaciones. Eso va en `property_records` (solo admin).
- En consultas públicas (`src/lib/publicApi.ts`) selecciona columnas explícitas. Nunca `select=*` sobre tablas con datos internos.
- No inventes datos de propiedades, precios ni condiciones. Lo no confirmado se guarda como "por confirmar".
- Toda moneda se muestra siempre con su código (USD o MXN).
- No subas documentos legales al bucket público `property-images`.
- Cada cambio de esquema es una migración nueva en `supabase/migrations/`, con RLS probada. Después de cambiar el esquema, regenera `src/integrations/supabase/types.ts`.
- Antes de terminar un paso corre `npm run lint`, `npm test` y `npm run build`, y dime el resultado real.
- No hagas commit ni deploy sin que yo lo pida.