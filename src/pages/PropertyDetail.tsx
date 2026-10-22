import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { useToast } from '@/hooks/use-toast';
import { fetchProperty } from '@/lib/publicApi';
import { phoneUrl, whatsappLink } from '@/config/site';
import { formatPrice, getPropertyImages } from '@/lib/properties';
import PropertyGallery from '@/components/property/PropertyGallery';
import {
    HONEYPOT_FIELD,
    getFieldErrors,
    insertPublicLead,
    isBotSubmission,
    publicLeadSchema,
    type PublicLeadErrors,
} from '@/lib/leads';

// Fallback image
import property1 from '@/assets/property-1.webp';

const typeLabels: Record<string, string> = {
    casa: 'Casa',
    oficina: 'Oficina',
    lote: 'Lote Residencial',
    inversion: 'Terreno de Inversión',
};

const emptyForm = {
    name: '',
    phone: '',
    email: '',
    message: '',
};

const PropertyDetail = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [honeypot, setHoneypot] = useState('');
    const [errors, setErrors] = useState<PublicLeadErrors>({});

    const { data: property = null, isLoading: loading } = useQuery({
        queryKey: ['property', id],
        queryFn: () => fetchProperty(id!),
        enabled: !!id,
    });

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: property?.title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast({ title: 'Enlace copiado', description: 'El enlace de la propiedad está en tu portapapeles.' });
        } catch (error) {
            // El usuario canceló el diálogo de compartir
            if (error instanceof DOMException && error.name === 'AbortError') return;
            toast({ title: 'Error', description: 'No se pudo compartir el enlace.', variant: 'destructive' });
        }
    };

    const handleSubmitInterest = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = publicLeadSchema.safeParse({
            ...formData,
            property_type: property?.type,
        });
        if (!result.success) {
            setErrors(getFieldErrors(result.error));
            return;
        }

        const onSuccess = () => {
            toast({
                title: '¡Mensaje enviado!',
                description: 'Un asesor se pondrá en contacto contigo pronto.',
            });
            setFormData(emptyForm);
            setIsInterestModalOpen(false);
        };

        // Bot: simulamos éxito sin guardar nada
        if (isBotSubmission(honeypot)) {
            onSuccess();
            return;
        }

        setSubmitting(true);

        try {
            const notesPrefix = property
                ? `Interesado en: ${property.title}\nUbicación: ${property.location}\nPrecio: ${formatPrice(Number(property.price), property.currency)}`
                : undefined;
            await insertPublicLead(result.data, 'pagina_propiedad', notesPrefix);
            onSuccess();
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
                <Header solid />
                <main className="container pt-32 pb-20 text-center">
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

    const price = formatPrice(Number(property.price), property.currency);
    const whatsappHref = whatsappLink(
        `Hola, me interesa la propiedad "${property.title}" (${price}). ${window.location.href}`,
    );
    const galleryImages = getPropertyImages(property);
    const propertyImages = galleryImages.length > 0 ? galleryImages : [property1];

    return (
        <div className="min-h-screen pb-24 lg:pb-0">
            <Header solid />

            <main className="pt-20 md:pt-24">
                {/* Breadcrumb (en móvil basta el botón "Volver") */}
                <div className="hidden md:block bg-secondary/50 py-4">
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

                <div className="container py-3 md:py-8 lg:py-12">
                    {/* Back Button */}
                    <Button variant="ghost" className="mb-2 md:mb-6 -ml-3 md:ml-0" asChild>
                        <Link to="/#propiedades">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a propiedades
                        </Link>
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Left - Image & Details */}
                        <div className="lg:col-span-2 min-w-0 space-y-5 md:space-y-6">
                            {/* Gallery: de borde a borde en móvil */}
                            <div className="-mx-6 md:mx-0">
                                <PropertyGallery
                                    key={property.id}
                                    images={propertyImages}
                                    title={property.title}
                                >
                                    {property.featured && (
                                        <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-accent text-accent-foreground px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-sm">
                                            Propiedad Destacada
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 md:top-4 md:right-4 flex gap-2">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="rounded-full"
                                            onClick={handleShare}
                                            aria-label="Compartir propiedad"
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </PropertyGallery>
                            </div>

                            {/* Property Info */}
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="min-w-0">
                                        <span className="text-accent text-xs md:text-sm font-semibold uppercase tracking-wider">
                                            {typeLabels[property.type] || property.type}
                                        </span>
                                        <h1 className="text-[1.6rem] leading-tight lg:text-3xl font-sans font-semibold mt-1 md:mt-2">
                                            {property.title}
                                        </h1>
                                        <div className="flex items-start gap-2 text-muted-foreground mt-2">
                                            <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                                            <span>{property.location}</span>
                                        </div>
                                        {/* Precio visible arriba en móvil (en escritorio va en la tarjeta lateral) */}
                                        <div className="lg:hidden mt-3 text-2xl font-sans font-bold text-foreground">
                                            {price}
                                        </div>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-6 py-4 md:py-6 border-y border-border">
                                    {property.beds && (
                                        <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:text-left sm:gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center">
                                                <BedDouble className="h-6 w-6 text-accent" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{property.beds}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Recámaras</div>
                                            </div>
                                        </div>
                                    )}
                                    {property.baths && (
                                        <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:text-left sm:gap-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center">
                                                <Bath className="h-6 w-6 text-accent" />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{property.baths}</div>
                                                <div className="text-xs sm:text-sm text-muted-foreground">Baños</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center text-center gap-1.5 sm:flex-row sm:text-left sm:gap-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center">
                                            <Maximize className="h-6 w-6 text-accent" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{property.area}</div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">Superficie</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {property.description && (
                                    <div className="py-4 md:py-6">
                                        <h2 className="text-lg md:text-xl font-sans font-medium mb-3 md:mb-4">Descripción</h2>
                                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                            {property.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right - Price & CTA (en móvil lo reemplaza la barra inferior fija) */}
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24 bg-background border border-border rounded-lg p-6 space-y-6">
                                <div>
                                    <span className="text-sm text-muted-foreground">Precio</span>
                                    <div className="text-3xl font-sans font-bold text-foreground">
                                        {price}
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
                                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-5 w-5" />
                                            WhatsApp
                                        </a>
                                    </Button>

                                    <Button variant="outline" size="lg" className="w-full" asChild>
                                        <a href={phoneUrl}>
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

            {/* Barra de acciones fija en móvil */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <div className="text-[0.7rem] leading-none text-muted-foreground">Precio</div>
                        <div className="truncate font-sans text-lg font-bold leading-tight">{price}</div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        asChild
                    >
                        <a href={phoneUrl} aria-label="Llamar">
                            <Phone className="h-5 w-5" />
                        </a>
                    </Button>
                    <Button
                        size="icon"
                        className="h-11 w-11 shrink-0 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                        asChild
                    >
                        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <MessageCircle className="h-5 w-5" />
                        </a>
                    </Button>
                    <Button
                        variant="gold"
                        className="h-11 shrink-0 px-4"
                        onClick={() => setIsInterestModalOpen(true)}
                    >
                        Me interesa
                    </Button>
                </div>
            </div>

            {/* Interest Modal */}
            <Dialog open={isInterestModalOpen} onOpenChange={setIsInterestModalOpen}>
                <DialogContent className="sm:max-w-[425px] max-h-[90svh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Me interesa esta propiedad</DialogTitle>
                        <DialogDescription>
                            Déjanos tus datos y un asesor te contactará para darte más información sobre {property.title}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitInterest} className="space-y-4" noValidate>
                        {/* Honeypot antispam: oculto para personas */}
                        <input
                            type="text"
                            name={HONEYPOT_FIELD}
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            className="hidden"
                        />

                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo *</Label>
                            <Input
                                id="name"
                                autoComplete="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Tu nombre"
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Tu número de WhatsApp"
                                required
                            />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email (opcional)</Label>
                            <Input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="tu@email.com"
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsInterestModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="gold" disabled={submitting}>
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
