import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Loader2, Star, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { getPropertyImages, moveItem } from '@/lib/properties';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

const propertyTypes = [
  { value: 'casa', label: 'Casa' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'lote', label: 'Lote Residencial' },
  { value: 'inversion', label: 'Terreno de Inversión' },
];

const statuses = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'sold', label: 'Vendido' },
];

const MAX_IMAGES = 20;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const PropertyForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // La primera imagen es la portada (se guarda también en image_url)
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'casa',
    category: '',
    location: '',
    price: '',
    currency: 'MXN',
    beds: '',
    baths: '',
    area: '',
    description: '',
    featured: false,
    status: 'active',
  });

  const { data: property, isLoading: loading, isError } = useQuery({
    queryKey: ['admin-property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la propiedad',
        variant: 'destructive',
      });
      navigate('/admin/properties');
    }
  }, [isError, navigate, toast]);

  useEffect(() => {
    if (!property) return;
    setFormData({
      title: property.title,
      type: property.type,
      category: property.category,
      location: property.location,
      price: String(property.price),
      currency: property.currency,
      beds: property.beds ? String(property.beds) : '',
      baths: property.baths ? String(property.baths) : '',
      area: property.area,
      description: property.description || '',
      featured: property.featured,
      status: property.status,
    });
    setImages(getPropertyImages(property));
  }, [property]);

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(fileName, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);
    return publicUrl;
  };

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
        description: `${rejected} archivo(s) no son imágenes o pesan más de 5MB`,
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

    setUploading(true);

    const results = await Promise.allSettled(toUpload.map(uploadImage));
    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value);
    const failed = results.length - uploaded.length;

    if (failed > 0) {
      toast({
        title: 'Error',
        description: `No se pudieron subir ${failed} imagen(es)`,
        variant: 'destructive',
      });
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    setImages((prev) => moveItem(prev, index, 0));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => moveItem(prev, index, index + direction));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const propertyData: PropertyInsert | PropertyUpdate = {
      title: formData.title,
      type: formData.type,
      category: formData.category || formData.type,
      location: formData.location,
      price: parseFloat(formData.price),
      currency: formData.currency,
      beds: formData.beds ? parseInt(formData.beds) : null,
      baths: formData.baths ? parseInt(formData.baths) : null,
      area: formData.area,
      description: formData.description || null,
      featured: formData.featured,
      status: formData.status,
      image_url: images[0] ?? null,
      images,
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('properties')
        .insert(propertyData as PropertyInsert);
      error = insertError;
    }

    if (error) {
      toast({
        title: 'Error',
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} la propiedad`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Éxito',
        description: `Propiedad ${isEditing ? 'actualizada' : 'creada'} correctamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-property', id] });
      queryClient.invalidateQueries({ queryKey: ['property-stats'] });
      queryClient.invalidateQueries({ queryKey: ['public-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      navigate('/admin/properties');
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-sans font-semibold">
            {isEditing ? 'Editar propiedad' : 'Nueva propiedad'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Modifica los datos de la propiedad'
              : 'Completa el formulario para agregar una nueva propiedad'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Villa Oceánica Premium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de propiedad *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Ensenada, Baja California"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe las características principales de la propiedad..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precio y características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Ej: 8500000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beds">Recámaras</Label>
                  <Input
                    id="beds"
                    type="number"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                    placeholder="Ej: 4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baths">Baños</Label>
                  <Input
                    id="baths"
                    type="number"
                    value={formData.baths}
                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                    placeholder="Ej: 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Área *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Ej: 350 m²"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Marcar como propiedad destacada</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <p className="text-sm text-muted-foreground">
                La primera imagen es la portada del catálogo. Usa la estrella para cambiarla
                y las flechas para ordenar la galería.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        onClick={() => removeImage(index)}
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
                          onClick={() => moveImage(index, -1)}
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
                            onClick={() => makeCover(index)}
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
                          onClick={() => moveImage(index, 1)}
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
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
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
                      Puedes seleccionar varias a la vez · PNG, JPG hasta 5MB · {images.length}/{MAX_IMAGES}
                    </span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/properties')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear propiedad'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PropertyForm;
