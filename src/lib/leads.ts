import { z } from 'zod';
import { insertLead } from '@/lib/publicApi';

// Los límites coinciden con la política RLS "Public can insert leads".
export const publicLeadSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  phone: z.string().trim().min(1, 'El teléfono es requerido').max(20, 'El teléfono es muy largo'),
  email: z.string().trim().email('Email inválido').max(255, 'El email es muy largo').or(z.literal('')),
  property_type: z.enum(['casa', 'oficina', 'lote', 'inversion'], {
    errorMap: () => ({ message: 'Selecciona un tipo de propiedad' }),
  }),
  message: z.string().trim().max(1000, 'El mensaje es muy largo').optional(),
});

export type PublicLeadData = z.infer<typeof publicLeadSchema>;
export type PublicLeadErrors = Partial<Record<keyof PublicLeadData, string>>;

export type PublicLeadSource = 'formulario_web' | 'pagina_propiedad';

// Nombre del campo oculto "honeypot": un humano no lo ve ni lo llena,
// un bot que rellena todos los inputs sí.
export const HONEYPOT_FIELD = 'website';

export const isBotSubmission = (honeypotValue: string | undefined) =>
  !!honeypotValue && honeypotValue.trim() !== '';

export const getFieldErrors = (error: z.ZodError): PublicLeadErrors => {
  const fieldErrors: PublicLeadErrors = {};
  error.errors.forEach((err) => {
    const field = err.path[0] as keyof PublicLeadData;
    if (!fieldErrors[field]) fieldErrors[field] = err.message;
  });
  return fieldErrors;
};

export const buildPublicLead = (
  data: PublicLeadData,
  source: PublicLeadSource,
  notesPrefix?: string,
) => {
  const notes = [notesPrefix, data.message].filter(Boolean).join('\n\n');
  return {
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    property_type: data.property_type,
    notes: notes || null,
    status: 'nuevo',
    source,
  };
};

export const insertPublicLead = async (
  data: PublicLeadData,
  source: PublicLeadSource,
  notesPrefix?: string,
) => {
  await insertLead(buildPublicLead(data, source, notesPrefix));
};
