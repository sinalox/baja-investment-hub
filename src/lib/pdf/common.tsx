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

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View wrap={false}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

export const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value && value.trim() !== '' ? value : 'Sin dato'}</Text>
  </View>
);
