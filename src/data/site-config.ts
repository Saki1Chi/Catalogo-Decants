// Datos del negocio — TODO: reemplazar con la info real del cliente.
// Esto alimenta la barra de anuncios, el header, el hero, el footer y contacto.
export const siteConfig = {
  nombreNegocio: "Nombre del Negocio",
  eslogan: "Catálogo de fragancias — completá con el eslogan real del cliente",
  // El hero parte el titular en dos para poder acentuar la primera frase en
  // otro color (recurso tomado de Fragancias Fiord).
  titularAcento: "Decants originales",
  titularResto: "de las casas que ya conocés",
  introHero:
    "Fracciones de 3, 5 y 10 ml del frasco original, envasadas a pedido. Probá una fragancia completa antes de comprarla entera.",
  moneda: "MXN",

  // Mensajes rotativos de la barra superior. TODO: ajustar a las condiciones
  // reales del cliente (montos de envío, promociones vigentes).
  anuncios: [
    "Decants fraccionados de perfume 100% original",
    "Envíos a todo el país",
    "Consultá disponibilidad por WhatsApp",
  ],

  // Trust bar bajo el hero — patrón de reducción de fricción antes del grid.
  confianza: [
    {
      titulo: "100% originales",
      texto: "Fraccionados del frasco original, nunca réplicas.",
    },
    {
      titulo: "Desde 3 ml",
      texto: "Probá la fragancia completa sin comprar el frasco.",
    },
    {
      titulo: "Atención directa",
      texto: "Te asesoramos por WhatsApp antes de elegir.",
    },
  ],

  contacto: {
    telefono: "+52 55 0000 0000", // TODO: número real
    whatsapp: "5250000000", // TODO: solo dígitos, con lada país, sin signos
    email: "contacto@ejemplo.com", // TODO: correo real
    direccion: "Dirección del showroom (opcional)", // TODO o borrar si no aplica
    horario: "Lunes a viernes, 10:00–18:00", // TODO
  },
  redes: {
    instagram: "", // TODO: usuario o URL completa, vacío = no se muestra
    facebook: "",
  },
};
