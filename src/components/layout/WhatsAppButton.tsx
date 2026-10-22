import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/config/site';

interface WhatsAppButtonProps {
  message?: string;
}

// Botón flotante de WhatsApp, el canal principal de contacto desde el celular
const WhatsAppButton = ({
  message = 'Hola, me interesa recibir información sobre sus propiedades.',
}: WhatsAppButtonProps) => (
  <a
    href={whatsappLink(message)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Escríbenos por WhatsApp"
    className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-6 md:bottom-6 z-40 flex items-center gap-2 h-14 w-14 md:w-auto md:px-5 justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 hover:brightness-105 active:scale-95 transition-all"
  >
    <MessageCircle className="h-7 w-7 md:h-6 md:w-6" />
    <span className="hidden md:inline font-semibold">WhatsApp</span>
  </a>
);

export default WhatsAppButton;
