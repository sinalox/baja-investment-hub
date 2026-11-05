import type { ReactNode } from 'react';
import { Image, Text, View } from '@react-pdf/renderer';
import { siteConfig } from '@/config/site';
import type { PdfImage } from './images';
import { colors, styles } from './theme';

export const PdfHeader = ({ logo, label }: { logo?: PdfImage | null; label?: string }) => (
  <View style={styles.header} fixed>
    {logo ? (
      <Image src={logo.src} style={{ height: 30, width: (30 * logo.width) / logo.height }} />
    ) : (
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 12 }}>{siteConfig.name}</Text>
    )}
    {label ? (
      <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: colors.red }}>{label}</Text>
    ) : (
      <View>
        <Text style={styles.headerContact}>WhatsApp / Tel. {siteConfig.phoneDisplay}</Text>
        <Text style={styles.headerContact}>{siteConfig.email}</Text>
      </View>
    )}
  </View>
);

export const PdfFooter = ({ note }: { note: string }) => (
  <View style={styles.footer} fixed>
    <Text style={{ flex: 1, paddingRight: 12 }}>{note}</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

// Secciones de filas: son cortas y van sin partir, así el título siempre va
// con su contenido (minPresenceAhead de react-pdf no es confiable). Para
// textos largos usar LongTextSection.
export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View wrap={false}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// Texto largo (descripción): el título va pegado a la primera línea y el resto
// fluye a las páginas siguientes. Se dibuja línea por línea porque react-pdf
// exagera el espacio de los saltos de línea dentro de un mismo Text.
export const LongTextSection = ({ title, lines }: { title: string; lines: string[] }) => {
  const line = (text: string, i: number) =>
    text.trim() === ''
      ? <View key={i} style={{ height: 6 }} />
      : <Text key={i} style={{ marginBottom: 2 }}>{text}</Text>;
  const [first, ...rest] = lines;
  return (
    <View>
      <View wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {first !== undefined && line(first, 0)}
      </View>
      {rest.map((text, i) => line(text, i + 1))}
    </View>
  );
};

export const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value && value.trim() !== '' ? value : 'Sin dato'}</Text>
  </View>
);
