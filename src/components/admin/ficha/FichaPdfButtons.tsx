import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface FichaPdfButtonsProps {
  propertyId: string;
  // La ficha cliente sale de la vista pública: solo si la propiedad se ve en la web
  isPublic: boolean;
  size?: 'sm' | 'default';
  label?: string;
}

const FichaPdfButtons = ({ propertyId, isPublic, size = 'sm', label }: FichaPdfButtonsProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState<'cliente' | 'interna' | null>(null);

  const generate = async (kind: 'cliente' | 'interna') => {
    setGenerating(kind);
    try {
      // La librería de PDF se descarga solo al usarla
      if (kind === 'cliente') {
        const { downloadClientePdfById } = await import('@/lib/pdf/downloadClientePdf');
        await downloadClientePdfById(propertyId);
      } else {
        const { downloadInternaPdf } = await import('@/lib/pdf/downloadInternaPdf');
        await downloadInternaPdf(propertyId);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'No se pudo generar la ficha',
        description: error instanceof Error ? error.message : 'Intenta de nuevo',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size={size} disabled={!!generating} aria-label="Descargar ficha PDF">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {label && <span className="ml-2">{generating ? 'Generando…' : label}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ficha técnica PDF</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!isPublic} onSelect={() => generate('cliente')}>
          Ficha para cliente
          {!isPublic && <span className="ml-2 text-xs text-muted-foreground">(solo visibles en la web)</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => generate('interna')}>Ficha interna (uso interno)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FichaPdfButtons;
