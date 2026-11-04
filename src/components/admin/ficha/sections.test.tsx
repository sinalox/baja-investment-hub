import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ReactNode } from 'react';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

import {
  SectionComercial,
  SectionDocumentacion,
  SectionIdentificacion,
  SectionMaterial,
  SectionPrecio,
  SectionServicios,
  SectionSuperficie,
  SectionUbicacion,
  SectionVerificacion,
} from './sections';
import { toFormValues, type FichaValues } from './schema';

const Wrapper = ({ children, values }: { children: ReactNode; values?: Partial<FichaValues> }) => {
  const form = useForm<FichaValues>({ defaultValues: { ...toFormValues(), ...values } });
  return <FormProvider {...form}>{children}</FormProvider>;
};

const renderSection = (node: ReactNode, values?: Partial<FichaValues>) =>
  render(<Wrapper values={values}>{node}</Wrapper>);

describe('secciones de la ficha', () => {
  it('renderiza las 9 secciones sin errores', () => {
    const sections = [
      <SectionIdentificacion key="A" code="LB-C001" />,
      <SectionUbicacion key="B" />,
      <SectionSuperficie key="C" />,
      <SectionPrecio key="D" />,
      <SectionServicios key="E" />,
      <SectionDocumentacion key="F" />,
      <SectionComercial key="G" />,
      <SectionMaterial key="H" minPhotos={12} uploading={false} onUploadingChange={() => {}} />,
      <SectionVerificacion key="I" fichaVersion={3} />,
    ];
    for (const section of sections) {
      const { unmount } = renderSection(section);
      unmount();
    }
  });

  it('muestra el folio y la visibilidad de cada campo', () => {
    renderSection(<SectionIdentificacion code="LB-C001" />);
    expect(screen.getByText('LB-C001')).toBeInTheDocument();
    expect(screen.getAllByText('Público').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Interno').length).toBeGreaterThan(0);
  });

  it('marca los P* con su interruptor de publicación', () => {
    renderSection(<SectionUbicacion />);
    expect(screen.getByText('Público si lo activas')).toBeInTheDocument();
    expect(screen.getByLabelText('Publicar ubicación exacta')).toBeInTheDocument();
  });

  it('usa la moneda del precio en el financiamiento', () => {
    const values = toFormValues();
    values.property.currency = 'USD';
    renderSection(<SectionPrecio />, values);
    expect(screen.getByText('Enganche (USD)')).toBeInTheDocument();
    expect(screen.getByText('Mensualidad (USD)')).toBeInTheDocument();
  });

  it('lista los 7 servicios y los 9 documentos', () => {
    renderSection(<SectionServicios />);
    for (const label of ['Agua', 'Electricidad', 'Drenaje', 'Alumbrado público', 'Calle pavimentada', 'Internet', 'Gas']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    const { container } = renderSection(<SectionDocumentacion />);
    expect(container.querySelectorAll('input[type="date"]').length).toBe(9 + 1); // 9 documentos + fecha de revisión
  });

  it('avisa cuántas fotos faltan para publicar', () => {
    const values = toFormValues();
    values.property.images = ['a.webp', 'b.webp'];
    renderSection(<SectionMaterial minPhotos={12} uploading={false} onUploadingChange={() => {}} />, values);
    expect(screen.getByText(/faltan 10 para poder publicar/)).toBeInTheDocument();
  });
});
