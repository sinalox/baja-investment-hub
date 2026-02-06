import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    {
      label: 'Propiedades',
      href: '#propiedades',
      dropdown: [
        { label: 'Casas', href: '#casas' },
        { label: 'Oficinas', href: '#oficinas' },
        { label: 'Lotes Residenciales', href: '#lotes' },
        { label: 'Terrenos de Inversión', href: '#inversion' },
      ],
    },
    { label: 'Desarrollos', href: '#desarrollos' },
    { label: 'Sobre Nosotros', href: '#nosotros' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className={`font-serif text-xl md:text-2xl font-semibold tracking-tight transition-colors duration-300 ${
            isScrolled ? 'text-foreground' : 'text-white'
          }`}>
            <span className="block leading-tight">HEREDIA</span>
            <span className="block text-xs md:text-sm font-sans font-normal tracking-[0.25em] opacity-80">
              LAND BAJA
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <div key={item.label} className="nav-item relative group">
              <a
                href={item.href}
                className={`flex items-center gap-1 text-sm font-medium transition-colors duration-300 link-underline ${
                  isScrolled
                    ? 'text-foreground hover:text-accent'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
                {item.dropdown && <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />}
              </a>
              {item.dropdown && (
                <div className="nav-dropdown absolute top-full left-0 pt-3">
                  <div className="bg-background rounded-sm shadow-lg border border-border py-2 min-w-[200px]">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.label}
                        href={subItem.href}
                        className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {subItem.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:block">
          <Button variant="gold" size="lg">
            Agenda una visita
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`lg:hidden p-2 transition-colors ${
            isScrolled ? 'text-foreground' : 'text-white'
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-background shadow-lg transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="container py-6 flex flex-col gap-4">
          {navItems.map((item) => (
            <div key={item.label}>
              <a
                href={item.href}
                className="block py-2 text-foreground font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
              {item.dropdown && (
                <div className="pl-4 mt-2 space-y-2">
                  {item.dropdown.map((subItem) => (
                    <a
                      key={subItem.label}
                      href={subItem.href}
                      className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Button variant="gold" size="lg" className="mt-4">
            Agenda una visita
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
