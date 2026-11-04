import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import { moveItem } from '@/lib/properties';
import { MAX_IMAGES } from './schema';

// Tamaño máximo del archivo original; se comprime antes de subirlo
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const uploadImage = async (original: File) => {
  const file = await compressImage(original);
  // HEIC/HEIF (iPhone) que el navegador no pudo convertir: no se verían en la web
  if (/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
    throw new Error('Formato HEIC no soportado');
  }
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('property-images')
    .upload(fileName, file, {
      contentType: file.type,
      // Los nombres son únicos, así que el navegador puede cachearlas un año
      cacheControl: '31536000',
    });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('property-images')
    .getPublicUrl(fileName);
  return publicUrl;
};

interface GalleryEditorProps {
  value: string[];
  onChange: (images: string[]) => void;
  uploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  // Mínimo de fotos para publicar según el tipo (app_settings)
  minPhotos: number;
}

// Galería de fotos: la primera es la portada (se replica en image_url)
const GalleryEditor = ({ value: images, onChange, uploading, onUploadingChange, minPhotos }: GalleryEditorProps) => {
  const { toast } = useToast();
  // Las subidas terminan después de varios renders: usar siempre la lista actual
  const latest = useRef(images);
  latest.current = images;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    // Permite volver a elegir los mismos archivos
    e.target.value = '';
    if (selected.length === 0) return;

    const valid = selected.filter(
      (file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE,
    );
    const rejected = selected.length - valid.length;
    if (rejected > 0) {
      toast({
        title: 'Algunas imágenes no se subieron',
        description: `${rejected} archivo(s) no son imágenes o pesan más de 20MB`,
        variant: 'destructive',
      });
    }

    const available = MAX_IMAGES - images.length;
    const toUpload = valid.slice(0, available);
    if (valid.length > available) {
      toast({
        title: 'Límite de imágenes',
        description: `Cada propiedad puede tener hasta ${MAX_IMAGES} imágenes`,
        variant: 'destructive',
      });
    }
    if (toUpload.length === 0) return;

    onUploadingChange(true);

    const results = await Promise.allSettled(toUpload.map(uploadImage));
    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value);
    const failed = results.length - uploaded.length;

    if (failed > 0) {
      toast({
        title: 'Error',
        description: `No se pudieron subir ${failed} imagen(es). Si son fotos HEIC de iPhone, conviértelas a JPG.`,
        variant: 'destructive',
      });
    }

    onChange([...latest.current, ...uploaded]);
    onUploadingChange(false);
  };

  const missing = Math.max(0, minPhotos - images.length);

  return (
    <div className="space-y-4">
      <p className={`text-sm ${missing > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
        {images.length} de {MAX_IMAGES} fotos ·{' '}
        {missing > 0
          ? `faltan ${missing} para poder publicar (mínimo ${minPhotos})`
          : `cumple el mínimo para publicar (${minPhotos})`}
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                index === 0 ? 'border-accent' : 'border-transparent'
              }`}
            >
              <img
                src={image}
                alt={`Imagen ${index + 1}`}
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-sm">
                  Portada
                </span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => onChange(images.filter((_, i) => i !== index))}
                aria-label={`Quitar imagen ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-1 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onChange(moveItem(images, index, index - 1))}
                  disabled={index === 0}
                  aria-label="Mover a la izquierda"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {index !== 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => onChange(moveItem(images, index, 0))}
                  >
                    <Star className="h-3.5 w-3.5 mr-1" />
                    Portada
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onChange(moveItem(images, index, index + 1))}
                  disabled={index === images.length - 1}
                  aria-label="Mover a la derecha"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {uploading
                ? 'Subiendo...'
                : images.length === 0
                  ? 'Haz clic para subir imágenes'
                  : 'Agregar más imágenes'}
            </span>
            <span className="text-xs text-muted-foreground">
              Puedes seleccionar varias a la vez · Se optimizan automáticamente
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default GalleryEditor;
