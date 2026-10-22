-- Galería de imágenes por propiedad. images[1] es la portada y se replica en
-- image_url para que el catálogo y el código existente sigan funcionando.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- Migrar la imagen única existente a la galería
UPDATE public.properties
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND cardinality(images) = 0;
