# Spec de campos de la ficha técnica (FT-01)

Fuente de verdad para el registro de propiedades. Leyenda abajo.

Leyenda: **P** = público (landing y ficha para cliente) · **I** = interno (solo admin y ficha interna) · **P*** = público solo si el admin lo activa o está confirmado.

### A. Identificación
| Campo | Dónde vive | Visibilidad | Notas |
|---|---|---|---|
| ID interno `LB-T###` | `properties.code` | P | Autogenerado, consecutivo, único, nunca se reutiliza. Se muestra como “Ref.” |
| Nombre comercial | `properties.title` | P | |
| Tipo | `properties.type` | P | Ya existe |
| Estado de flujo | `property_records.workflow_status` | I | borrador, en_validacion, listo, publicada, apartada, vendida, pausada, retirada |
| Propietario / desarrollador (nombre, contacto) | `property_records` | I | Nunca público |
| Contrato (exclusiva/abierta, vigencia) | `property_records` | I | |

### B. Ubicación
| Campo | Visibilidad | Notas |
|---|---|---|
| Zona y municipio (`location`) | P | Ya existe |
| Referencia de llegada | P | Texto aproximado |
| Enlace de Google Maps (pin exacto) | I por defecto, **P*** con interruptor “publicar ubicación exacta” | |
| Distancias o tiempos a puntos clave | P | Texto libre |
| Estado del acceso (pavimentado, terracería, otro) | P | |

### C. Superficie y características
| Campo | Visibilidad | Notas |
|---|---|---|
| Superficie m² (numérico) | P | Hoy `area` es texto: agregar `area_m2 numeric` y conservar `area` para no romper nada |
| Medidas frente x fondo | P | |
| Medida de escritura vs medida real (¿difieren?) | I | |
| Tipo de lote (esquina, intermedio, frente al mar, vista al mar) | P | |
| Topografía | P | |
| Uso de suelo | P* | Solo si está confirmado |

### D. Precio y condiciones
| Campo | Visibilidad | Notas |
|---|---|---|
| Precio de contado y moneda | P | `price`, `currency` ya existen |
| Financiamiento: enganche, plazo, mensualidad (+ moneda), intereses y cargos | P* | Solo si `financing_confirmed = true` |
| Requisitos del plan de pagos | P* | |
| Gastos a cargo del comprador | P* | Si “por confirmar”, se muestra “Por confirmar” |
| Vigencia del precio (fecha hasta la que está confirmado) | I | La landing puede mostrar “Precio actualizado el dd/mm/aaaa” usando la fecha de verificación |

### E. Servicios (por servicio: agua, electricidad, drenaje, alumbrado público, calle pavimentada, internet, gas)
Estados: `instalado_en_lote`, `en_la_zona`, `no_hay`, `por_confirmar`.
| Campo | Visibilidad | Notas |
|---|---|---|
| Estado por servicio | P | La landing no muestra “instalado” si no hay evidencia registrada |
| Evidencia / nota por servicio | I | **Obligatoria** para marcar `instalado_en_lote` |

### F. Situación documental
| Campo | Visibilidad |
|---|---|
| Tipo de tenencia (privada, ejidal, comunal, fideicomiso, otra, por confirmar) | I (P* con interruptor) |
| Checklist: escritura, libertad de gravamen, predial, identificación/poderes, plano, uso de suelo, evidencia de servicios, contrato firmado, aprobación escrita de precio: cada uno `recibido`, `revisado`, fecha | I |
| Alertas abiertas (texto) | I |
| Revisado por / fecha | I |

### G. Posicionamiento comercial
| Campo | Visibilidad | Notas |
|---|---|---|
| Diferenciadores comprobables (máx. 3) | P | Sin promesas de plusvalía ni rendimiento |
| Perfil de comprador | I | |
| Llamada a la acción principal | P | |
| Datos que NO se publican (nota) | I | |

### H. Material
| Campo | Visibilidad | Notas |
|---|---|---|
| Fotos (`images`, máx. 20, portada primero) | P | Ya existe |
| URL de video (YouTube/Vimeo/enlace) | P | Nuevo: `video_url` |
| Fecha de las tomas | I | |
| Enlace a carpeta de Drive de la propiedad | I | |

### I. Verificación
| Campo | Visibilidad |
|---|---|
| Última verificación con propietario (fecha, medio) | I (la fecha se puede mostrar como “actualizado el”) |
| Verificado por | I |
| Aprobado para publicar por / fecha | I |
| Versión de la ficha (`ficha_version`, entero que sube en cada guardado) | I |

### Criterio “Listo para publicar” (el candado)
Una propiedad solo puede pasar a publicada (`status = 'active'`) si:
1. Tiene contrato registrado (tipo y vigencia).
2. Tiene precio y moneda, y fecha de verificación del precio.
3. El checklist documental está revisado, sin alertas abiertas.
4. Los campos obligatorios de A, B, C y D están completos.
5. Tiene al menos **12 fotos**.
6. Tiene aprobación del responsable registrada (nombre y fecha).
7. La verificación tiene menos de **15 días** (constante configurable).