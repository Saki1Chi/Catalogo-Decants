import { siteConfig } from "@/data/site-config";
import { Perfume } from "@/types";

// El catálogo no cobra ni toma pedidos: cada CTA termina en un WhatsApp con la
// consulta ya redactada, así el cliente no tiene que escribirla desde cero.
function enlace(texto: string): string {
  return `https://wa.me/${siteConfig.contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export function consultaWhatsAppGeneral(): string {
  return enlace("Hola, quiero consultar por los decants del catálogo.");
}

export function consultaWhatsApp(perfume: Perfume, ml?: number): string {
  const detalle = ml ? ` en ${ml} ml` : "";
  return enlace(
    `Hola, me interesa ${perfume.nombre} de ${perfume.marca}${detalle}. ¿Está disponible?`,
  );
}
