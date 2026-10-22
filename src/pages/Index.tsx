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
    </div>
  );
};

export default Index;
