import { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  // Contenido superpuesto a la imagen principal (badges, botones)
  children?: ReactNode;
}

const PropertyGallery = ({ images, title, children }: PropertyGalleryProps) => {
  const [current, setCurrent] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasMultiple = images.length > 1;

  // Mantener visible la miniatura activa, desplazando solo su contenedor
  // (scrollIntoView movería también la página)
  useEffect(() => {
    const container = thumbnailsRef.current;
    const thumb = thumbnailRefs.current[current];
    if (!container || !thumb) return;

    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = thumb;
    if (offsetLeft < container.scrollLeft) {
      container.scrollLeft = offsetLeft;
    } else if (offsetLeft + offsetWidth > container.scrollLeft + container.clientWidth) {
      container.scrollLeft = offsetLeft + offsetWidth - container.clientWidth;
    }
    if (offsetTop < container.scrollTop) {
      container.scrollTop = offsetTop;
    } else if (offsetTop + offsetHeight > container.scrollTop + container.clientHeight) {
      container.scrollTop = offsetTop + offsetHeight - container.clientHeight;
    }
  }, [current]);

  const goTo = (index: number) => {
    setCurrent((index + images.length) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMultiple) return;
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  };

  return (
    <div
      className={cn('flex flex-col gap-3', hasMultiple && 'md:flex-row')}
      onKeyDown={handleKeyDown}
    >
      {/* Imagen principal */}
      <div className="relative aspect-[16/10] flex-1 rounded-lg overflow-hidden bg-secondary group">
        <img
          key={images[current]}
          src={images[current]}
          alt={hasMultiple ? `${title} - imagen ${current + 1} de ${images.length}` : title}
          className="w-full h-full object-cover animate-fade-in"
        />

        {children}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas: abajo en móvil, columna al costado en pantallas medianas.
          En la columna, el contenedor absoluto iguala la altura de la imagen
          principal y hace scroll si hay muchas. */}
      {hasMultiple && (
        <div className="md:relative md:w-24 shrink-0">
          <div
            ref={thumbnailsRef}
            className="relative flex gap-2 overflow-x-auto p-1 md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto"
          >
            {images.map((image, index) => (
              <button
                key={image}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-current={index === current}
                className={cn(
                  'relative shrink-0 w-20 h-16 md:w-full md:h-20 rounded-md overflow-hidden ring-2 ring-offset-1 ring-offset-background transition-all',
                  index === current ? 'ring-accent' : 'ring-transparent opacity-70 hover:opacity-100',
                )}
              >
                <img src={image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
