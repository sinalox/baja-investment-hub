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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <PropertySearch />
        <Properties />
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
