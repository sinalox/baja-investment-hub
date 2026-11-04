import type { ReactNode } from 'react';
import { Controller, get, useFormContext, type FieldPath } from 'react-hook-form';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { FichaValues } from './schema';

type Name = FieldPath<FichaValues>;

// Visibilidad según el spec: P público, I interno, P* público solo si se activa
export type Visibility = 'P' | 'I' | 'P*';

const visibilityStyles: Record<Visibility, { label: string; className: string; icon: typeof Eye }> = {
  P: { label: 'Público', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Eye },
  I: { label: 'Interno', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Lock },
  'P*': { label: 'Público si lo activas', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: EyeOff },
};

export const VisibilityBadge = ({ visibility }: { visibility: Visibility }) => {
  const { label, className, icon: Icon } = visibilityStyles[visibility];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

interface FieldProps {
  name: Name;
  label: string;
  visibility?: Visibility;
  hint?: string;
  required?: boolean;
  className?: string;
}

const FieldShell = ({
  name, label, visibility, hint, required, className, children,
}: FieldProps & { children: ReactNode }) => {
  const { formState: { errors } } = useFormContext<FichaValues>();
  const error = get(errors, name)?.message as string | undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        {visibility && <VisibilityBadge visibility={visibility} />}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export const TextField = ({
  type = 'text', placeholder, inputMode, ...props
}: FieldProps & {
  type?: 'text' | 'number' | 'date' | 'url';
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) => {
  const { register } = useFormContext<FichaValues>();
  return (
    <FieldShell {...props}>
      <Input
        id={props.name}
        type={type}
        step={type === 'number' ? 'any' : undefined}
        inputMode={inputMode ?? (type === 'number' ? 'decimal' : undefined)}
        placeholder={placeholder}
        {...register(props.name)}
      />
    </FieldShell>
  );
};

export const TextAreaField = ({ rows = 3, placeholder, ...props }: FieldProps & { rows?: number; placeholder?: string }) => {
  const { register } = useFormContext<FichaValues>();
  return (
    <FieldShell {...props}>
      <Textarea id={props.name} rows={rows} placeholder={placeholder} {...register(props.name)} />
    </FieldShell>
  );
};

// Radix Select no admite value="" en sus opciones: se usa un centinela
const NONE = '__none__';

export const SelectField = ({
  options, allowEmpty = false, placeholder = 'Selecciona…', ...props
}: FieldProps & { options: Record<string, string> | readonly string[]; allowEmpty?: boolean; placeholder?: string }) => {
  const { control } = useFormContext<FichaValues>();
  const entries = Array.isArray(options)
    ? (options as readonly string[]).map((value) => [value, value])
    : Object.entries(options);
  return (
    <FieldShell {...props}>
      <Controller
        control={control}
        name={props.name}
        render={({ field }) => (
          <Select
            value={(field.value as string) || (allowEmpty ? NONE : undefined)}
            onValueChange={(value) => field.onChange(value === NONE ? '' : value)}
          >
            <SelectTrigger id={props.name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {allowEmpty && <SelectItem value={NONE}>Sin especificar</SelectItem>}
              {entries.map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldShell>
  );
};

// Interruptor de los campos P*: "publicar en la web"
export const PublishSwitch = ({ name, label = 'Publicar en la web' }: { name: Name; label?: string }) => {
  const { control, formState: { errors } } = useFormContext<FichaValues>();
  const error = get(errors, name)?.message as string | undefined;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Switch id={name} checked={field.value as boolean} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor={name} className="text-sm font-normal">{label}</Label>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export const SwitchField = ({ name, label, hint }: { name: Name; label: string; hint?: string }) => {
  const { control } = useFormContext<FichaValues>();
  return (
    <div className="flex items-start gap-3">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch id={name} checked={field.value as boolean} onCheckedChange={field.onChange} className="mt-0.5" />
        )}
      />
      <div>
        <Label htmlFor={name}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
};

// Casillas para listas (p. ej. tipo de lote: esquina + vista al mar)
export const CheckboxGroupField = ({
  options, ...props
}: FieldProps & { options: Record<string, string> }) => {
  const { control } = useFormContext<FichaValues>();
  return (
    <FieldShell {...props}>
      <Controller
        control={control}
        name={props.name}
        render={({ field }) => {
          const selected = (field.value as string[]) ?? [];
          return (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(options).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(value)}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? [...selected, value] : selected.filter((v) => v !== value))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          );
        }}
      />
    </FieldShell>
  );
};

// Grupo visual dentro de una pestaña
export const FieldGroup = ({ title, description, children }: { title?: string; description?: string; children: ReactNode }) => (
  <div className="space-y-4">
    {title && (
      <div>
        <h3 className="font-sans text-base font-medium">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    )}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </div>
);
