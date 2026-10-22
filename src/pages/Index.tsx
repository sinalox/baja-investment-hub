import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';
import PropertySearch from '@/components/sections/PropertySearch';
import Properties from '@/components/sections/Properties';
import FeaturedDevelopment from '@/components/sections/FeaturedDevelopment';
import WhyInvest from '@/components/sections/WhyInvest';
import HowItWorks from '@/components/sections/HowItWorks';
import Testimonials from '@/components/sections/Testimonials';
import ContactForm from '@/components/sections/ContactForm';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { emptyFilters, type SearchFilters } from '@/lib/properties';

const Index = () => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(emptyFilters);
  const { hash } = useLocation();

  // Al llegar desde otra ruta (p. ej. "/#propiedades") el navegador no hace
  // scroll al ancla por sí solo en una SPA
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  // Precargar el detalle de propiedad cuando la landing ya cargó, para que
  // "Ver detalles" abra sin esperar la descarga del chunk
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./PropertyDetail');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <PropertySearch onSearch={setSearchFilters} />
        <Properties filters={searchFilters} />
        <FeaturedDevelopment />
        <WhyInvest />
        <HowItWorks />
        <Testimonials />
        <ContactForm />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
