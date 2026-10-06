import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    ArrowLeft,
    Heart,
    Share2,
    Phone,
    MessageCircle,
    Loader2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Fallback images
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';

const fallbackImages = [property1, property2, property3, property4];

type Property = Database['public']['Tables']['properties']['Row'];

const typeLabels: Record<string, string> = {
    casa: 'Casa',
    oficina: 'Oficina',
    lote: 'Lote Residencial',
    inversion: 'Terreno de Inversión',
};

const PropertyDetail = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    });

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching property:', error);
            } else {
                setProperty(data);
            }
            setLoading(false);
        };

        fetchProperty();
    }, [id]);

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleSubmitInterest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            toast({
                title: 'Error',
                description: 'Por favor completa los campos requeridos.',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);

        try {
            const { error } = await supabase.from('leads').insert({
                name: formData.name,
                phone: formData.phone,
                email: formData.email || null,
                property_type: property?.type || 'casa',
                notes: `Interesado en: ${property?.title}\nUbicación: ${property?.location}\nPrecio: ${property ? formatPrice(Number(property.price), property.currency) : ''}\n\n${formData.message || ''}`,
                status: 'nuevo',
                source: 'pagina_propiedad',
            });

            if (error) throw error;

            toast({
                title: '¡Mensaje enviado!',
                description: 'Un asesor se pondrá en contacto contigo pronto.',
            });

            setFormData({ name: '', phone: '', email: '', message: '' });
            setIsInterestModalOpen(false);
        } catch (error) {
            console.error('Error submitting interest:', error);
            toast({
                title: 'Error',
                description: 'Hubo un problema al enviar tu solicitud.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="container py-20 text-center">
                    <h1 className="text-2xl font-sans mb-4">Propiedad no encontrada</h1>
                    <p className="text-muted-foreground mb-8">
                        La propiedad que buscas no existe o ya no está disponible.
                    </p>
                    <Button asChild>
                        <Link to="/">Volver al inicio</Link>
                    </Button>
                </main>
                <Footer />
            </div>
        );
    }

    const propertyImage = property.image_url || fallbackImages[0];

    return (
        <div className="min-h-screen">
            <Header />

            <main>
                {/* Breadcrumb */}
                <div className="bg-secondary/50 py-4">
                    <div className="container">
                        <div className="flex items-center gap-2 text-sm">
                            <Link to="/" className="text-muted-foreground hover:text-foreground">
                                Inicio
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            <Link to="/#propiedades" className="text-muted-foreground hover:text-foreground">
                                Propiedades
                            </Link>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-foreground font-medium">{property.title}</span>
                        </div>
                    </div>
                </div>

                <div className="container py-8 lg:py-12">
                    {/* Back Button */}
                    <Button variant="ghost" className="mb-6" asChild>
                        <Link to="/#propiedades">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a propiedades
                        </Link>
                    </Button>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Left - Image & Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Main Image */}
                            <div className="relative aspect-[16/10] rounded-lg overflow-hidden">
                                <img
                                    src={propertyImage}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                {property.featured && (
                                    <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold rounded-sm">
                                        Propiedad Destacada
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <Button variant="secondary" size="icon" className="rounded-full">
                                        <Heart className="h-5 w-5" />
                                    </Button>
                                    <Button variant="secondary" size="icon" className="rounded-full">
                                        <Share2 className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Property Info */}
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <span className="text-accent text-sm font-semibold uppercase tracking-wider">
                                            {typeLabels[property.type] || property.type}
                                        </span>
                                        <h1 className="text-2xl lg:text-3xl font-sans font-semibold mt-2">
                                            {property.title}
                                        </h1>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                            <MapPin className="h-5 w-5" />
                                            <span>{property.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-6 py-6 border-y border-border">
                                    {property.beds && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                                                <BedDouble className="h-6 w-6 text-accent" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{property.beds}</div>
                                                <div className="text-sm text-muted-foreground">Recámaras</div>
                                            </div>
                                        </div>
                                    )}
                                    {property.baths && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                                                <Bath className="h-6 w-6 text-accent" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{property.baths}</div>
                                                <div className="text-sm text-muted-foreground">Baños</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                                            <Maximize className="h-6 w-6 text-accent" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{property.area}</div>
                                            <div className="text-sm text-muted-foreground">Superficie</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {property.description && (
                                    <div className="py-6">
                                        <h2 className="text-xl font-sans font-medium mb-4">Descripción</h2>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                            {property.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right - Price & CTA */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-background border border-border rounded-lg p-6 space-y-6">
                                <div>
                                    <span className="text-sm text-muted-foreground">Precio</span>
                                    <div className="text-3xl font-sans font-bold text-foreground">
                                        {formatPrice(Number(property.price), property.currency)}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        variant="gold"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => setIsInterestModalOpen(true)}
                                    >
                                        <Heart className="h-5 w-5" />
                                        Me interesa esta propiedad
                                    </Button>

                                    <Button variant="outline" size="lg" className="w-full" asChild>
                                        <a href="https://wa.me/526461234567" target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-5 w-5" />
                                            WhatsApp
                                        </a>
                                    </Button>

                                    <Button variant="outline" size="lg" className="w-full" asChild>
                                        <a href="tel:+526461234567">
                                            <Phone className="h-5 w-5" />
                                            Llamar ahora
                                        </a>
                                    </Button>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <p className="text-sm text-muted-foreground text-center">
                                        ¿Tienes preguntas? Nuestros asesores están listos para ayudarte.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Interest Modal */}
            <Dialog open={isInterestModalOpen} onOpenChange={setIsInterestModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Me interesa esta propiedad</DialogTitle>
                        <DialogDescription>
                            Déjanos tus datos y un asesor te contactará para darte más información sobre {property.title}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitInterest} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+52 646 123 4567"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email (opcional)</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Mensaje (opcional)</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Cuéntanos qué te gustaría saber..."
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsInterestModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Enviando...' : 'Enviar solicitud'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PropertyDetail;
