
# Plan: CRM Inmobiliario Completo

## Resumen

Transformar el panel de administracion actual en un CRM inmobiliario completo con gestion de leads, seguimiento de interacciones y dashboard de ventas.

---

## Fase 1: Base de Datos

Crear una migracion SQL para las nuevas tablas y politicas de seguridad:

### Tabla `leads`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid | Identificador unico |
| name | text | Nombre del prospecto |
| email | text | Correo electronico |
| phone | text | Telefono/WhatsApp |
| property_type | text | Tipo de propiedad de interes (casa, oficina, lote, inversion) |
| budget_min | numeric | Presupuesto minimo (opcional) |
| budget_max | numeric | Presupuesto maximo (opcional) |
| status | text | Estado del lead (nuevo, contactado, calificado, ganado, perdido) |
| notes | text | Notas adicionales |
| source | text | Origen del lead (formulario web, whatsapp, referido) |
| created_at | timestamptz | Fecha de creacion |
| updated_at | timestamptz | Fecha de actualizacion |

### Tabla `interactions`
| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid | Identificador unico |
| lead_id | uuid | Referencia al lead (FK) |
| type | text | Tipo de actividad (llamada, email, reunion, visita, nota) |
| description | text | Descripcion de la interaccion |
| scheduled_at | timestamptz | Fecha programada (opcional) |
| created_at | timestamptz | Fecha de creacion |

### Politicas RLS
- Solo usuarios con rol `admin` pueden ver, crear, editar y eliminar leads e interacciones
- Se usara la funcion existente `has_role()` para evitar recursion

---

## Fase 2: Nueva Seccion de Leads

### Archivo: `src/pages/admin/AdminLeads.tsx`

Pagina principal de gestion de prospectos con:

- **Tabla interactiva** usando el componente `Table` de shadcn/ui
- **Columnas**: Nombre, Email, Telefono, Tipo de Interes, Estado, Fecha, Acciones
- **Filtros**: 
  - Por estado (Nuevo, Contactado, Calificado, Ganado, Perdido)
  - Por tipo de propiedad de interes
- **Badges de estado** con colores diferenciados:
  - Nuevo: Azul
  - Contactado: Amarillo
  - Calificado: Morado
  - Ganado: Verde
  - Perdido: Rojo
- **Boton "Registrar Interaccion"** que abre un modal (Dialog)
- **Acciones rapidas**: Ver detalle, Editar, Eliminar

### Archivo: `src/components/admin/InteractionModal.tsx`

Modal para registrar interacciones con:
- Selector de tipo de actividad (llamada, email, reunion, visita, nota)
- Campo de descripcion
- Selector de fecha (opcional)
- Botones Guardar/Cancelar

---

## Fase 3: Vista de Detalle del Lead

### Archivo: `src/pages/admin/LeadDetail.tsx`

Pagina de detalle del prospecto con:

- **Informacion del lead**: Nombre, contacto, estado, notas
- **Seccion de edicion inline** para actualizar estado y notas
- **Historial de interacciones**: Lista cronologica de todas las actividades registradas
- **Seccion "Propiedades Sugeridas"**: 
  - Consulta automatica a la tabla `properties` filtrando por `type` que coincida con el `property_type` del lead
  - Si el lead tiene presupuesto definido, filtrar tambien por rango de precio
  - Mostrar como cards con imagen, titulo, precio y boton "Ver propiedad"

---

## Fase 4: Dashboard de Ventas

### Archivo: `src/pages/admin/AdminDashboard.tsx` (actualizar)

Agregar nuevas metricas y graficos:

- **Tarjetas de KPIs**:
  - Total de Leads Activos (status != 'perdido' y status != 'ganado')
  - Tasa de Conversion (leads ganados / total leads * 100)
  - Leads Nuevos Este Mes
  - Valor Potencial (suma de budget_max de leads activos)

- **Grafico de Leads por Mes**:
  - Usar `recharts` (ya instalado) con `ChartContainer`
  - Grafico de barras mostrando leads creados por mes
  - Ultimos 6 meses

- **Distribucion por Estado**:
  - Grafico de pie/dona con la distribucion actual de leads por estado

---

## Fase 5: Navegacion

### Archivo: `src/components/admin/AdminLayout.tsx` (actualizar)

Agregar nuevos enlaces al sidebar:

```text
Dashboard (icono LayoutDashboard) -> /admin
Propiedades (icono Building2) -> /admin/properties  
Prospectos (icono Users) -> /admin/leads           <- NUEVO
Reportes (icono BarChart3) -> /admin/reports       <- NUEVO
```

### Archivo: `src/App.tsx` (actualizar)

Agregar nuevas rutas protegidas:
- `/admin/leads` -> AdminLeads
- `/admin/leads/:id` -> LeadDetail
- `/admin/reports` -> AdminReports (pagina simple con resumen)

---

## Fase 6: Formulario de Contacto

### Archivo: `src/components/sections/ContactForm.tsx` (actualizar)

Modificar el formulario para:

1. **Agregar estado para los campos**:
   - name, phone, email, property_type, message

2. **Validacion con Zod**:
   - Nombre requerido (max 100 caracteres)
   - Email valido
   - Telefono requerido
   - Tipo de propiedad requerido

3. **Funcion de envio**:
   - Insertar nuevo registro en tabla `leads` con:
     - `status: 'nuevo'`
     - `source: 'formulario_web'`
     - `notes: mensaje del formulario`
   - Mostrar toast de confirmacion
   - Limpiar formulario

4. **Nota**: Esta insercion funcionara sin autenticacion porque el formulario es publico. Se necesita una politica RLS especial que permita INSERT anonimo pero solo en campos especificos.

---

## Estructura de Archivos

```text
src/
  pages/
    admin/
      AdminDashboard.tsx    <- Actualizar con KPIs y graficos
      AdminLeads.tsx        <- NUEVO: Lista de leads
      LeadDetail.tsx        <- NUEVO: Detalle del lead
      AdminReports.tsx      <- NUEVO: Pagina de reportes
  components/
    admin/
      AdminLayout.tsx       <- Actualizar navegacion
      InteractionModal.tsx  <- NUEVO: Modal para interacciones
    sections/
      ContactForm.tsx       <- Actualizar para guardar leads
```

---

## Detalles Tecnicos

### Migracion SQL

```sql
-- Crear tabla leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  property_type text NOT NULL,
  budget_min numeric,
  budget_max numeric,
  status text NOT NULL DEFAULT 'nuevo',
  notes text,
  source text DEFAULT 'formulario_web',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla interactions
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  description text,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Politicas para admins (usando la funcion has_role existente)
CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage interactions" ON public.interactions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Politica especial para insercion anonima de leads (formulario publico)
CREATE POLICY "Public can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Trigger para updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Componentes shadcn/ui a Utilizar
- Card, Table, Badge, Button (existentes)
- Dialog para modal de interacciones
- Select para filtros
- Tabs para vista de leads
- ChartContainer con recharts para graficos

### Flujo de Match de Propiedades
1. Obtener `property_type` del lead
2. Consultar `properties` con filtro `type = property_type` y `status = 'active'`
3. Si el lead tiene `budget_max`, agregar filtro `price <= budget_max`
4. Limitar a 3-5 propiedades sugeridas
5. Mostrar como cards con CTA para ver detalle

---

## Proximos Pasos

Una vez aprobado el plan:
1. Crear migracion de base de datos
2. Actualizar tipos de TypeScript
3. Crear componentes de leads y interacciones
4. Actualizar dashboard con graficos
5. Modificar formulario de contacto
6. Actualizar navegacion y rutas
