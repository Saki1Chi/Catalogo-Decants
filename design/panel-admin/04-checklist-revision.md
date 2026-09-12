# Checklist para revisar lo que entregue Claude Design

Marcá cada punto antes de dar el diseño por bueno. Si algo falla, pedí la corrección (hay frases útiles al final de `03-prompts.md`).

## Marca y estilo
- [ ] Se reconoce como la misma marca que las capturas del catálogo público.
- [ ] Esquinas rectas en botones, campos, tarjetas y modales.
- [ ] Botones primarios en negro tinta; el dorado **nunca** es un botón.
- [ ] Cormorant solo en títulos grandes; tablas y formularios en Inter.
- [ ] Sin sombras de tarjeta, degradados ni colores fuera de la paleta.
- [ ] Precios y stock alineados y con números tabulares.

## Datos reales
- [ ] Usa los perfumes reales del brief, no marcas inventadas.
- [ ] Aparece un nombre largo (~60 caracteres) y no rompe el diseño.
- [ ] Aparece un perfume con solo 10 ml.
- [ ] Aparecen perfumes agotados, en últimas unidades, ocultos y "por confirmar".
- [ ] Formato de precio `$1,250` (sin decimales).
- [ ] Estados de stock: 0 Agotado · 1–3 Últimas unidades · 4+ Disponible · Sin registrar.

## Roles
- [ ] Cada pantalla deja claro si la ve el Dueño o el Empleado.
- [ ] El Empleado ve bloqueado (con motivo) lo que no puede hacer: precios, eliminar, datos del negocio, usuarios.
- [ ] El Empleado sí puede: ajustar stock, registrar pedidos, compartir el catálogo.

## Celular
- [ ] Todas las pantallas clave existen en 390 px, no solo escritorio.
- [ ] Áreas táctiles de 44 px o más.
- [ ] Ajustar stock: 3 toques o menos desde Inicio.
- [ ] Registrar un pedido de 2 perfumes: se entiende en menos de un minuto.
- [ ] Acción principal abajo, al alcance del pulgar.

## Flujos del Dueño
- [ ] Subir 10 % los precios de una marca: selección → vista previa → confirmación → deshacer.
- [ ] Importar el Excel: emparejamiento con dudosos resueltos a mano y vista previa de diferencias.
- [ ] Crear un perfume nuevo completo, con vista previa de la tarjeta pública.
- [ ] Eliminar pide confirmación nombrando el perfume y ofrece ocultar como alternativa.
- [ ] Compartir catálogo: link, QR descargable, afiche imprimible y botón de WhatsApp.
- [ ] Invitar un empleado genera un link para mandar por WhatsApp.

## Sin conexión y sincronización
- [ ] El indicador global existe en sus 4 estados y se ve en todas las pantallas.
- [ ] Hay marca "Pendiente" en elementos sin sincronizar.
- [ ] Existe la pantalla de conflicto con ambos valores, autor y hora.
- [ ] El stock se muestra como movimientos (+/−), no como valor que se pisa.
- [ ] Lo que no funciona sin conexión aparece deshabilitado con el motivo.

## Estados
- [ ] Cargando con esqueleto.
- [ ] Vacío con acción principal.
- [ ] Sin resultados con "Limpiar filtros".
- [ ] Error con qué hacer.
- [ ] Cambios sin guardar con Guardar / Descartar.
- [ ] Validación junto al campo (color + ícono + texto).
- [ ] Éxito con "Deshacer".
- [ ] Modo oscuro de las pantallas principales.

## Textos
- [ ] Español de México, trato de tú, sin jerga técnica.
- [ ] Ningún "¿Estás seguro?": las confirmaciones nombran la acción.
- [ ] Los nombres de botones son consistentes entre pantallas.

## Entrega
- [ ] Página Índice con todas las pantallas y el flujo.
- [ ] Página Componentes con estados (normal, hover, foco, deshabilitado, error).
- [ ] Página Tokens (claro/oscuro).
- [ ] Exportado: PDF de revisión + paquete de entrega para Claude Code, guardados en `design/panel-admin/entregas/`.
