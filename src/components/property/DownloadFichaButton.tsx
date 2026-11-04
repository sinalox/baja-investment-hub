import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { PublicProperty } from '@/lib/publicApi';
import { cn } from '@/lib/utils';

// Ficha cliente en PDF. La librería se descarga solo al pulsar el botón para
// no pesar en la carga de la página (la mayoría entra desde el celular).
const DownloadFichaButton = ({ property, className }: { property: PublicProperty; className?: string }) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const handleClick = async () => {
    setGenerating(true);
    try {
      const { downloadClientePdf } = await import('@/lib/pdf/downloadClientePdf');
      await downloadClientePdf(property);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: 'No se pudo generar la ficha', description: 'Intenta de nuevo en un momento.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button type="button" variant="outline" className={cn('w-full', className)} onClick={handleClick} disabled={generating}>
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {generating ? 'Generando ficha…' : 'Descargar ficha técnica (PDF)'}
    </Button>
  );
};

export default DownloadFichaButton;
