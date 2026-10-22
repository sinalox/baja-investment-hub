# Baja Investment Hub — Documentación del Proyecto

Sitio web inmobiliario de **Heredia Land Baja** (Tijuana, Baja California, México) con un **CRM interno** para administrar propiedades y prospectos (leads).

El proyecto se generó inicialmente con **Lovable** (plantilla `vite_react_shadcn_ts`) y después se ha seguido editando a mano.

---

## 1. Resumen funcional

| Área | Qué hace |
|------|----------|
| **Landing pública** (`/`) | Hero, buscador de propiedades, catálogo filtrable, desarrollo destacado, razones para invertir, cómo funciona, testimonios y formulario de contacto. |
| **Detalle de propiedad** (`/properties/:id`) | Ficha de una propiedad con galería (imagen grande + miniaturas), modal "Me interesa" que crea un lead y botón para compartir. |
| **Aviso de privacidad** (`/privacidad`) | Texto base del aviso de privacidad (pendiente de revisión legal). |
| **Login admin** (`/admin/login`) | Inicio de sesión con email y contraseña (Supabase Auth). |
| **Dashboard** (`/admin`) | KPIs de propiedades y leads, gráfica de leads por mes (últimos 6) y distribución por estado. |
| **Propiedades** (`/admin/properties`) | Listado, alta, edición y borrado; galería de hasta 20 imágenes con portada y orden, en Supabase Storage. |
| **Prospectos** (`/admin/leads`) | Tabla de leads con filtros por estado y tipo, alta manual, borrado y registro de interacciones. |
| **Detalle de lead** (`/admin/leads/:id`) | Datos del lead, edición de estado y notas, historial de interacciones y propiedades sugeridas según tipo y presupuesto. |
| **Reportes** (`/admin/reports`) | Resumen y gráficas de leads. |

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Build / dev server | Vite 5 + `@vitejs/plugin-react-swc` (puerto **8080**) |
| Lenguaje | TypeScript 5 |
| UI | React 18, Tailwind CSS 3, shadcn/ui (Radix UI), lucide-react |
| Routing | react-router-dom 6 (SPA) |
| Datos / estado servidor | @tanstack/react-query 5 |
| Formularios / validación | zod (react-hook-form está instalado) |
| Gráficas | recharts (a través de `ChartContainer` de shadcn) |
| Fechas | date-fns (locale `es`) |
| Backend | **Supabase**: Postgres + Auth + Storage + RLS |
| Notificaciones | `useToast` (shadcn) y sonner |
| Testing | Vitest + Testing Library + jsdom |
| Analítica | Google Analytics (gtag `G-3H9F6Y8FX9` en `index.html`) |
| Despliegue | SPA estática; `public/_redirects` (`/* /index.html 200`) para Netlify o similar |

---

## 3. Estructura de carpetas

```text
baja-investment-hub/
├── index.html                 # HTML base, meta tags, Google Analytics
├── public/                    # Logos (1.webp / 2.webp), og-image.jpg, favicons, _redirects, robots.txt
├── supabase/
│   ├── config.toml            # project_id de Supabase
│   └── migrations/            # Esquema SQL (properties, user_roles, leads, interactions)
├── .lovable/plan.md           # Plan original del CRM (en español)
└── src/
    ├── main.tsx / App.tsx     # Entrada y definición de rutas
    ├── index.css              # Tokens de diseño (variables HSL) y utilidades
    ├── assets/                # Imágenes de hero, desarrollo destacado y fallback de propiedades
    ├── config/site.ts         # Teléfono, WhatsApp, email, dirección y redes (un solo lugar)
    ├── lib/
    │   ├── leads.ts           # Validación zod de leads públicos, honeypot e inserción
    │   ├── properties.ts      # Filtros del catálogo, rangos de precio, formato de moneda
    │   └── *.test.ts          # Tests unitarios
    ├── hooks/
    │   ├── useAuth.tsx        # Contexto de autenticación + verificación de rol admin
    │   ├── use-toast.ts
    │   └── use-mobile.tsx
    ├── integrations/supabase/
    │   ├── client.ts          # Cliente Supabase (autogenerado)
    │   └── types.ts           # Tipos de la BD (autogenerado)
    ├── components/
    │   ├── layout/            # Header, Footer
    │   ├── sections/          # Secciones de la landing
    │   ├── admin/             # AdminLayout, ProtectedRoute, InteractionModal, NewLeadModal
    │   └── ui/                # Componentes shadcn/ui
    ├── pages/
    │   ├── Index.tsx, PropertyDetail.tsx, PrivacyPolicy.tsx, AdminAuth.tsx, NotFound.tsx
    │   └── admin/             # AdminDashboard, AdminProperties, PropertyForm,
    │                          # AdminLeads, LeadDetail, AdminReports
    └── test/setup.ts          # Setup de Vitest
```

---

## 4. Rutas

Definidas en [src/App.tsx](src/App.tsx). Las rutas `/admin/*` (salvo el login) van envueltas en `<ProtectedRoute requireAdmin>`.

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | `Index` | Público |
| `/properties/:id` | `PropertyDetail` | Público |
| `/privacidad` | `PrivacyPolicy` | Público |
| `/admin/login` | `AdminAuth` | Público |
| `/admin` | `AdminDashboard` | Admin |
| `/admin/properties` | `AdminProperties` | Admin |
| `/admin/properties/new` | `PropertyForm` | Admin |
| `/admin/properties/:id/edit` | `PropertyForm` | Admin |
| `/admin/leads` | `AdminLeads` | Admin |
| `/admin/leads/:id` | `LeadDetail` | Admin |
| `/admin/reports` | `AdminReports` | Admin |
| `*` | `NotFound` | Público |

---

## 5. Base de datos (Supabase)

### 5.1 Tablas

**`properties`**: catálogo de inmuebles.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | |
| title | text | requerido |
| type | text | `casa` · `oficina` · `lote` · `inversion` (CHECK) |
| category | text | requerido (por defecto igual a `type` desde el formulario) |
| location | text | requerido |
| price | decimal(15,2) | requerido |
| currency | text | por defecto `MXN` |
| image_url | text | URL de la portada (= `images[1]`) |
| images | text[] | Galería de imágenes (máx. 20); la primera es la portada |
| beds, baths | integer | opcionales |
| area | text | requerido (texto libre, p. ej. "250 m²") |
| description | text | |
| featured | boolean | se muestra primero y con badge "Destacado" |
| status | text | `active` · `inactive` · `sold` (CHECK) |
| created_at, updated_at | timestamptz | `updated_at` se actualiza por trigger |

**`user_roles`**: roles por usuario (`app_role` enum: `admin`, `user`). Única por `(user_id, role)`.

**`leads`**: prospectos.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | |
| name | text | requerido |
| email | text | opcional |
| phone | text | requerido |
| property_type | text | requerido |
| budget_min, budget_max | numeric | opcionales |
| status | text | `nuevo` · `contactado` · `calificado` · `ganado` · `perdido` |
| notes | text | |
| source | text | `formulario_web`, `pagina_propiedad`, alta manual, etc. |
| created_at, updated_at | timestamptz | trigger de `updated_at` |

**`interactions`**: actividades con un lead (`lead_id` FK con `ON DELETE CASCADE`).
Tipos: llamada, email, reunión, visita, nota. Incluye `description` y `scheduled_at` opcional.

### 5.2 Funciones y triggers
- `has_role(_user_id, _role)`: `SECURITY DEFINER`, evita recursión en RLS.
- `update_updated_at_column()`: trigger en `properties` y `leads`.

### 5.3 Políticas RLS

| Tabla | Política |
|-------|----------|
| properties | **SELECT** público solo si `status = 'active'`; admin ve todas; INSERT/UPDATE/DELETE solo admin |
| user_roles | Cada usuario ve solo sus propios roles |
| leads | CRUD solo admin + **INSERT público restringido**: `status = 'nuevo'`, `source` en (`formulario_web`, `pagina_propiedad`), sin presupuesto, tipo válido y longitudes acotadas |
| interactions | CRUD solo admin |

### 5.4 Storage
- Bucket **`property-images`** (público). Lectura pública; subir, actualizar y borrar solo admin.
- El formulario valida que sea imagen y pese máximo 5 MB; el nombre se genera con `Date.now()` más un sufijo aleatorio.

---

## 6. Autenticación y permisos

[src/hooks/useAuth.tsx](src/hooks/useAuth.tsx):
1. Se suscribe a `onAuthStateChange` y luego llama a `getSession()`.
2. Si hay usuario, consulta `user_roles` para saber si es `admin` (`isAdmin`).
3. Tiene un timeout de seguridad de 5 s para no quedarse cargando para siempre.
4. Expone `signIn` y `signOut` (no hay registro público desde la app).

[ProtectedRoute](src/components/admin/ProtectedRoute.tsx): sin sesión redirige a `/admin/login`; con sesión pero sin rol admin muestra "Acceso denegado".

**Cómo dar acceso a un nuevo administrador**: crear el usuario en Supabase Auth y luego insertar el rol a mano:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<uuid-del-usuario>', 'admin');
```

---

## 7. Flujo de leads

```text
Visitante ──► Formulario de contacto (landing) ──┐
          └─► "Me interesa" en /properties/:id ──┼──► INSERT en leads (status = 'nuevo')
Admin ─────► "Nuevo lead" (NewLeadModal) ────────┘
                                                   │
                                                   ▼
                       /admin/leads ──► /admin/leads/:id
                                         ├─ cambiar estado y notas
                                         ├─ registrar interacciones
                                         └─ ver propiedades sugeridas
                                            (mismo tipo, activas, price ≤ budget_max, máx. 5)
```

- Ambos formularios públicos usan el mismo esquema zod de [src/lib/leads.ts](src/lib/leads.ts): nombre ≤ 100, teléfono ≤ 20, email opcional, tipo válido y mensaje ≤ 1000. Los límites coinciden con la política RLS.
- **Antispam**: un campo oculto (honeypot `website`). Si viene lleno, se simula el envío sin guardar nada.
- **Formulario de contacto** ([ContactForm.tsx](src/components/sections/ContactForm.tsx)): `source = 'formulario_web'`.
- **Página de propiedad** ([PropertyDetail.tsx](src/pages/PropertyDetail.tsx)): antepone en `notes` el título, la ubicación y el precio de la propiedad. `source = 'pagina_propiedad'`.

### KPIs del dashboard
- Leads activos: estado distinto de `ganado` y `perdido`.
- Tasa de conversión: ganados / total × 100.
- Leads de hoy.
- Valor potencial: suma de `budget_max` de los leads activos.
- Leads por mes (últimos 6) y distribución por estado.

---

## 8. Landing pública

Orden en [Index.tsx](src/pages/Index.tsx):

1. **Header**: logo que cambia con el scroll (`/2.webp` sobre el hero, `/1.webp` con fondo), navegación por anclas (`/#...`, funcionan desde cualquier página) y CTA "Agenda una visita" que lleva al formulario. Con la prop `solid` se muestra con fondo desde el inicio (páginas sin hero).
2. **Hero** (`#inicio`)
3. **PropertySearch**: filtros por tipo, ubicación (Ensenada, Rosarito, Tijuana, San Quintín, Valle de Guadalupe) y rango de precio en MXN. Filtra en tiempo real.
4. **Properties** (`#propiedades`): lee de Supabase las propiedades activas (destacadas primero), con pestañas por categoría y filtrado del lado del cliente. Las anclas `#casas`, `#oficinas`, `#lotes` e `#inversion` seleccionan la pestaña correspondiente. Usa imágenes de respaldo si no hay `image_url`.
5. **FeaturedDevelopment** (`#desarrollos`)
6. **WhyInvest** (`#nosotros`)
7. **HowItWorks**
8. **Testimonials**
9. **ContactForm** (`#contacto`)
10. **Footer**

### Diseño
- Tipografía: **Poppins** (sans principal) e Inter, cargadas desde Google Fonts.
- Paleta (en [src/index.css](src/index.css), en HSL): negro casi puro como `primary`, **dorado** como `accent` (`38 65% 50%`), y tonos arena y blanco cálido.
- Variantes de botón propias: `gold` y `dark`.

---

## 9. Configuración y ejecución

### Variables de entorno (`.env`)

`.env` no se versiona; se crea a partir de `.env.example`. En producción las variables se configuran en el hosting.

```env
VITE_SUPABASE_PROJECT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### Comandos

```sh
npm install          # el lockfile del proyecto es package-lock.json
npm run dev          # http://localhost:8080
npm run build        # build de producción en dist/
npm run build:dev    # build en modo development
npm run preview      # sirve el build
npm run lint         # ESLint
npm test             # Vitest (una pasada)
npm run test:watch
```

### Migraciones
Se aplican con la Supabase CLI (`supabase db push`) o desde el panel de Lovable/Supabase. Después de cambiar el esquema hay que regenerar `src/integrations/supabase/types.ts`.

---

## 10. Historial (git)

| Fecha | Cambio |
|-------|--------|
| 2026-02-06 | UI premium inicial de la landing |
| 2026-02-07 | Tema personalizado y estructura del panel admin |
| 2026-02-08 | Base de datos y UI del CRM de leads; alta manual de leads |
| 2026-10-06 | Mejoras de la landing, página de detalle de propiedad, assets, dashboard y `_redirects` para SPA |
| 2026-10-22 | Corrección de los problemas de la auditoría (ver sección 11) |

---

## 11. Auditoría (2026-10-22)

### Corregido
| # | Problema | Solución |
|---|----------|----------|
| 1 | El admin no veía propiedades inactivas o vendidas | Nueva política RLS `Admins can view all properties` |
| 2 | Anclas `#casas`, `#oficinas`, `#lotes`, `#inversion` rotas | `Properties` escucha el hash y selecciona la pestaña; los enlaces del Header y el Footer usan `/#...` y funcionan desde cualquier página |
| 3 | Botones "Agenda una visita" y "Ver propiedades" sin acción | Llevan a `#contacto` y `#propiedades` |
| 4 | `.env` versionado y duplicado | Fuera de git, en `.gitignore`, con plantilla `.env.example`; copia duplicada eliminada |
| 5 | INSERT público de leads sin restricciones | Política RLS acotada, validación zod compartida y honeypot antispam |
| 6 | `signUp` expuesto | Eliminado del contexto de auth |
| 7 | `lang="en"` y meta tags de Lovable | `lang="es"`, título, descripción, Open Graph/Twitter propios e imagen `og-image.jpg` (1200×630) |
| 8 | Datos de contacto repetidos y enlaces `#` | Centralizados en `src/config/site.ts`; las redes sin URL se ocultan; nueva página `/privacidad` |
| 9 | README genérico | Reescrito |
| 10–12 | Imagen duplicada, `bun.lockb` y carpeta vacía `integrations/` | Eliminados |
| 13 | Solo había un test de ejemplo | 17 tests de filtros, rangos de precio, validación y construcción de leads |
| 15 | Fetch con `useEffect` en varias páginas | `Properties`, `PropertyDetail`, `AdminProperties`, `AdminDashboard` y `PropertyForm` usan react-query, con invalidación de caché al guardar o borrar |

**Extras encontrados al corregir:**
- El filtro de precio "$5,000,000+" nunca devolvía resultados (el mínimo se interpretaba como `Infinity`).
- El formulario "Me interesa" no validaba el formato del email ni la longitud de los campos.
- El contenido de la página de propiedad quedaba debajo de la cabecera fija, y la cabecera transparente no se veía sobre fondo blanco.
- Los botones de favorito y compartir no hacían nada: compartir ahora usa `navigator.share` o copia el enlace, y favorito se quitó.
- Los 3 errores de lint que ya existían (`command.tsx`, `textarea.tsx`, `tailwind.config.ts`).

### Pendiente (requiere información o acción externa)
- **Aplicar la migración** `20261022120000_admin_properties_select_and_public_leads_hardening.sql` en Supabase.
- **Variables de entorno en el hosting**: como `.env` ya no está en git, hay que definir `VITE_SUPABASE_*` en el proveedor de despliegue.
- **Revisión legal** del aviso de privacidad y, si se necesita, una página de términos y condiciones (el enlace se quitó porque no había contenido).
- **URL absoluta para `og:image`** cuando haya dominio definitivo (Facebook y WhatsApp prefieren URLs absolutas).
- Para un antispam más fuerte: captcha (Cloudflare Turnstile o hCaptcha) o rate limiting con una Edge Function.
- `react-hook-form` sigue instalado porque lo usa `components/ui/form.tsx` de shadcn; los formularios usan estado manual con zod.
- Bundle JS > 500 kB: se podría dividir con `React.lazy` para separar el panel admin de la landing.
