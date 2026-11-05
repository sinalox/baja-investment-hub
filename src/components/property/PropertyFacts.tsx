import type { ReactNode } from 'react';
import {
  Bath, BedDouble, Building2, CheckCircle2, CircleDashed, CircleHelp, ExternalLink, MapPin, Maximize, PlayCircle, Ruler, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicProperty } from '@/lib/publicApi';
import {
  ACCESS_STATUS_LABELS,
  LOT_TYPE_LABELS,
  SERVICE_LABELS,
  SERVICE_STATUS_LABELS,
  TENURE_LABELS,
  formatArea,
  formatBaths,
  formatMeasures,
  formatPrice,
  formatSquareMeters,
  getVideoSource,
} from '@/lib/properties';

// Bloques de la ficha pública. Solo usan datos de la vista public_properties
// (P y P* activados) y cada bloque se oculta si no tiene nada que mostrar.

const hasText = (v: string | null | undefined): v is string => !!v && v.trim() !== '';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-3 border-t border-border py-5 md:py-6">
    <h2 className="text-lg md:text-xl font-sans font-medium">{title}</h2>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
    <dt className="text-sm text-muted-foreground sm:w-48 sm:shrink-0">{label}</dt>
    <dd className="text-sm text-foreground whitespace-pre-line">{children}</dd>
  </div>
);

const Fact = ({ icon: Icon, value, label }: { icon: typeof Maximize; value: string; label: string }) => (
  <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:text-left sm:gap-3">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center">
      <Icon className="h-6 w-6 text-accent" />
    </div>
    <div>
      <div className="font-semibold">{value}</div>
      <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
    </div>
  </div>
);

// Datos clave bajo el título. Recámaras/baños solo si son > 0 (un terreno
// tiene 0 y antes se pintaba "00").
export const KeyFacts = ({ property }: { property: PublicProperty }) => {
  const facts = [
    (property.beds ?? 0) > 0 && { icon: BedDouble, value: String(property.beds), label: 'Recámaras' },
    (property.baths ?? 0) > 0 && { icon: Bath, value: formatBaths(property.baths), label: 'Baños' },
    formatArea(property) && { icon: Maximize, value: formatArea(property), label: 'Terreno' },
    property.built_area_m2 != null && {
      icon: Building2, value: formatSquareMeters(property.built_area_m2), label: 'Construcción',
    },
    formatMeasures(property.frontage_m, property.depth_m) && {
      icon: Ruler, value: formatMeasures(property.frontage_m, property.depth_m), label: 'Frente × fondo',
    },
  ].filter(Boolean) as { icon: typeof Maximize; value: string; label: string }[];

  if (facts.length === 0) return null;
  return (
    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-6 py-4 md:py-6 border-y border-border">
      {facts.map((fact) => <Fact key={fact.label} {...fact} />)}
    </div>
  );
};

export const Differentiators = ({ items }: { items: string[] }) => {
  const list = items.filter(hasText);
  if (list.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2 pt-4">
      {list.map((item) => (
        <li key={item} className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-foreground">
          <CheckCircle2 className="h-4 w-4 text-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
};

export const LocationSection = ({ property }: { property: PublicProperty }) => {
  const access = property.access_status ? ACCESS_STATUS_LABELS[property.access_status] : null;
  if (!hasText(property.arrival_reference) && !hasText(property.distances) && !access && !property.maps_url) {
    return null;
  }
  return (
    <Section title="Ubicación">
      <dl className="divide-y divide-border">
        <Row label="Zona">{property.location}</Row>
        {hasText(property.arrival_reference) && <Row label="Cómo llegar">{property.arrival_reference}</Row>}
        {hasText(property.distances) && <Row label="Distancias">{property.distances}</Row>}
        {access && <Row label="Acceso">{access}</Row>}
      </dl>
      {property.maps_url && (
        <Button variant="outline" asChild>
          <a href={property.maps_url} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-4 w-4" />
            Ver ubicación en Google Maps
          </a>
        </Button>
      )}
    </Section>
  );
};

export const LandSection = ({ property }: { property: PublicProperty }) => {
  const lotTypes = property.lot_type.map((t) => LOT_TYPE_LABELS[t] ?? t);
  const tenure = property.tenure_type ? TENURE_LABELS[property.tenure_type] : null;
  if (lotTypes.length === 0 && !hasText(property.topography) && !hasText(property.measures_note)
    && !hasText(property.land_use) && !tenure) {
    return null;
  }
  return (
    <Section title="Características">
      <dl className="divide-y divide-border">
        {lotTypes.length > 0 && <Row label="Tipo de lote">{lotTypes.join(' · ')}</Row>}
        {hasText(property.topography) && <Row label="Topografía">{property.topography}</Row>}
        {hasText(property.measures_note) && <Row label="Medidas">{property.measures_note}</Row>}
        {hasText(property.land_use) && <Row label="Uso de suelo">{property.land_use}</Row>}
        {tenure && <Row label="Tenencia">{tenure}</Row>}
      </dl>
    </Section>
  );
};

const serviceIcon: Record<string, { icon: typeof CheckCircle2; className: string }> = {
  instalado_en_lote: { icon: CheckCircle2, className: 'text-emerald-600' },
  en_la_zona: { icon: CircleDashed, className: 'text-sky-600' },
  no_hay: { icon: XCircle, className: 'text-muted-foreground' },
  por_confirmar: { icon: CircleHelp, className: 'text-amber-600' },
};

export const ServicesSection = ({ services }: { services: PublicProperty['services'] }) => {
  const entries = Object.entries((services ?? {}) as Record<string, string>)
    .filter(([service]) => service in SERVICE_LABELS)
    // Mismo orden que el formulario
    .sort(([a], [b]) => Object.keys(SERVICE_LABELS).indexOf(a) - Object.keys(SERVICE_LABELS).indexOf(b));
  if (entries.length === 0) return null;
  return (
    <Section title="Servicios">
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {entries.map(([service, status]) => {
          const { icon: Icon, className } = serviceIcon[status] ?? serviceIcon.por_confirmar;
          return (
            <li key={service} className="flex items-start gap-2.5 text-sm">
              <Icon className={`h-5 w-5 shrink-0 ${className}`} />
              <span>
                <span className="font-medium">{SERVICE_LABELS[service]}</span>
                <span className="text-muted-foreground"> · {SERVICE_STATUS_LABELS[status] ?? status}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

export const ConditionsSection = ({ property }: { property: PublicProperty }) => {
  const money = (value: number | null) => (value != null ? formatPrice(value, property.currency) : null);
  const downPayment = money(property.down_payment);
  const monthly = money(property.monthly_payment);
  const hasFinancing = downPayment || monthly || property.term_months || hasText(property.interest_and_fees);
  const buyerCosts =
    property.buyer_costs_status === 'por_confirmar'
      ? 'Por confirmar'
      : hasText(property.buyer_costs) ? property.buyer_costs : null;

  if (!hasFinancing && !hasText(property.payment_requirements) && !buyerCosts) return null;
  return (
    <Section title="Precio y condiciones">
      <dl className="divide-y divide-border">
        <Row label="Precio de contado">{formatPrice(Number(property.price), property.currency)}</Row>
        {downPayment && <Row label="Enganche">{downPayment}</Row>}
        {property.term_months && <Row label="Plazo">{property.term_months} meses</Row>}
        {monthly && <Row label="Mensualidad">{monthly}</Row>}
        {hasText(property.interest_and_fees) && <Row label="Intereses y cargos">{property.interest_and_fees}</Row>}
        {hasText(property.payment_requirements) && <Row label="Requisitos">{property.payment_requirements}</Row>}
        {buyerCosts && <Row label="Gastos a cargo del comprador">{buyerCosts}</Row>}
      </dl>
    </Section>
  );
};

export const VideoSection = ({ url, title }: { url: string | null; title: string }) => {
  const video = getVideoSource(url);
  if (!video) return null;
  return (
    <Section title="Video">
      {video.kind === 'embed' ? (
        <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
          <iframe
            src={video.src}
            title={`Video de ${title}`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : (
        <Button variant="outline" asChild>
          <a href={video.href} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-4 w-4" />
            Ver video
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </Section>
  );
};
