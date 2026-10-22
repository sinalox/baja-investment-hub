import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { siteConfig, emailUrl } from '@/config/site';

// TODO: texto base según la LFPDPPP. Debe revisarlo un asesor legal antes de
// considerarse definitivo (razón social, transferencias, plazos ARCO, etc.).
const LAST_UPDATED = '22 de octubre de 2026';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header solid />

      <main className="container max-w-3xl pt-32 pb-20">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>

        <h1 className="section-title mb-2">Aviso de privacidad</h1>
        <p className="text-sm text-muted-foreground mb-10">Última actualización: {LAST_UPDATED}</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-sans font-medium text-foreground mb-3">Responsable</h2>
            <p>
              {siteConfig.name}, con domicilio en {siteConfig.address.line1}, {siteConfig.address.line2},
              es responsable del tratamiento de los datos personales que nos proporciones, conforme a la
              Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sans font-medium text-foreground mb-3">Datos que recabamos</h2>
            <p>A través de los formularios de este sitio recabamos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre completo</li>
              <li>Teléfono o WhatsApp</li>
              <li>Correo electrónico (opcional)</li>
              <li>Tipo de propiedad de interés y el mensaje que nos envíes</li>
            </ul>
            <p className="mt-2">No recabamos datos personales sensibles.</p>
          </section>

          <section>
            <h2 className="text-xl font-sans font-medium text-foreground mb-3">Finalidades</h2>
            <p>Usamos tus datos para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Contactarte y darte información sobre las propiedades que te interesan</li>
              <li>Agendar visitas y dar seguimiento a tu solicitud</li>
              <li>Enviarte propiedades que coincidan con lo que buscas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-sans font-medium text-foreground mb-3">Analítica</h2>
            <p>
              Este sitio usa Google Analytics para conocer de forma agregada cómo se usa la página
              (páginas visitadas, dispositivo, ubicación aproximada). Puedes bloquearlo desde la
              configuración de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sans font-medium text-foreground mb-3">Derechos ARCO</h2>
            <p>
              Puedes solicitar el acceso, rectificación, cancelación u oposición al tratamiento de tus
              datos, o revocar tu consentimiento, escribiendo a{' '}
              <a href={emailUrl} className="text-accent hover:underline">
                {siteConfig.email}
              </a>{' '}
              con tu nombre, un medio de contacto y la descripción de tu solicitud.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-sans font-medium text-foreground mb-3">Cambios a este aviso</h2>
            <p>Cualquier cambio a este aviso de privacidad se publicará en esta misma página.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
