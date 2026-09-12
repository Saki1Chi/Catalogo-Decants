> Este archivo es el PRIMER MENSAJE para pegar tal cual en claude.ai/design.
> Antes de mandarlo, adjuntá las imágenes de `adjuntos/capturas-sitio/`,
> `adjuntos/fotos-producto/` y el Excel `INVENTARIO_ESENCIAS_POR_ML_final.xlsx`.
> Copiá todo lo que está debajo de la línea.

---

Vamos a diseñar un panel de administración para un negocio de decants de perfume. Te adjunto capturas del catálogo público que ya existe, fotos reales de producto y el Excel real de precios.

**Antes de diseñar nada:** resume en 10 puntos lo que entendiste, lista las dudas o contradicciones que veas, y propón la lista de artboards que vas a crear (nombre en español + tamaño). No generes pantallas todavía.

# 1. Qué hay que diseñar

Un panel de administración para que el dueño y sus empleados gestionen el catálogo: perfumes, precios, stock, pedidos cargados a mano, datos del negocio y el link/QR con el que comparten el catálogo público.

- Funciona en computadora (1440 px) y celular (390×844), y se instala como app.
- Idioma: español de México, trato de tú. Moneda: MXN.
- **No** hay que rediseñar el catálogo público: ya existe (ver capturas). El panel debe sentirse de la misma marca, pero es una herramienta de trabajo: prioriza claridad y rapidez sobre lo decorativo.

# 2. El negocio

- Vende decants: fracciones de 3, 5 y 10 ml envasadas a pedido desde frascos originales.
- Catálogo actual: 132 perfumes de 52 marcas (Valentino, Dior, Lattafa, Armaf, Xerjoff, Afnan…). Hombre 79 · Mujer 25 · Unisex 28.
- Familias: Frescos 30 · Dulces 29 · Orientales 29 · Amaderados 24 · Frutales 14 · Florales 6.
- Precios: 3 ml de $20 a $320 · 5 ml de $35 a $450 · 10 ml de $50 a $750.
- No cobra en línea: el cliente consulta por WhatsApp y el pedido se cierra ahí o en persona.
- Hoy los precios viven en un Excel (columnas `NOMBRE | 10 ML | 5ML | 3ML`, nombres en mayúsculas y a veces sin marca). No existe registro de stock ni de pedidos: el panel es donde eso empieza.

# 3. Decisiones ya tomadas (no propongas alternativas)

| Tema | Decisión | Qué implica |
|---|---|---|
| Catálogo público | Datos en la nube. El catálogo es una app web instalable: se abre con link o QR y se ve sin internet | Pantalla "Compartir catálogo" (link, QR, afiche) e indicador de cuándo se actualizó |
| Panel sin internet | El panel se usa sin conexión: los cambios se guardan en el dispositivo y se sincronizan al volver | Indicador global de sincronización, marcas de "pendiente", resolución de conflictos |
| Pedidos | Se cargan a mano (llegan por WhatsApp o en persona). Sin integración con WhatsApp | Flujo "Registrar pedido" muy rápido, pensado primero para celular |
| Permisos | Dos roles: Dueño y Empleado | Controles bloqueados según el rol, con el motivo visible |

# 4. Usuarios y permisos

- **Dueño** — no técnico. Usa la computadora para cambios grandes (precios, altas) y el celular para revisar.
- **Empleado** — usa el celular en el mostrador. Necesita buscar un perfume, ajustar stock y registrar un pedido en pocos toques.

| Acción | Dueño | Empleado |
|---|---|---|
| Ver catálogo, precios y stock | ✓ | ✓ |
| Ajustar stock (entrada, salida, corrección) | ✓ | ✓ |
| Registrar y actualizar pedidos | ✓ | ✓ |
| Compartir el catálogo (link / QR) | ✓ | ✓ |
| Crear y editar perfumes (textos, fotos, notas), ocultarlos | ✓ | Solo lectura |
| Cambiar precios (uno o masivo), importar Excel | ✓ | — |
| Eliminar perfumes | ✓ | — |
| Datos del negocio | ✓ | — |
| Usuarios e invitaciones | ✓ | — |
| Historial de cambios | Todo | Solo lo propio |

Lo que el Empleado no puede hacer se muestra bloqueado con el motivo ("Solo el dueño puede cambiar precios"), nunca escondido sin explicación.

# 5. Módulos y pantallas

1. **Acceso** — iniciar sesión, aceptar invitación (link recibido por WhatsApp), recuperar acceso.
2. **Inicio** — resumen: agotados, últimas unidades, pedidos pendientes, cambios sin sincronizar, cuándo se actualizó el catálogo público. Accesos rápidos: Registrar pedido, Ajustar stock, Nuevo perfume, Compartir catálogo.
3. **Catálogo** — tabla en escritorio, lista en celular. Búsqueda por nombre, marca o nota. Filtros (género, familia, estado de stock, visible/oculto, destacado, ficha por confirmar) siempre visibles como chips removibles. Orden por nombre, marca, precio, stock o última modificación. Selección múltiple con acciones masivas. Edición en línea solo de precio y stock.
4. **Ficha de perfume** (crear/editar) — panel lateral en escritorio, pantalla completa en celular. Secciones: Identidad · Descripción y notas · Pirámide olfativa · Fotos · Presentaciones y precios · Stock · Visibilidad. Incluye vista previa de la tarjeta tal como se ve en el catálogo público.
5. **Precios masivos** — aumento o descuento (% o monto) sobre una selección o filtro, por presentación, con redondeo a múltiplos de 10. Vista previa antes/después, confirmación que dice cuántos perfumes cambian, y deshacer.
6. **Importar Excel** — subir archivo → emparejar filas con perfumes (automático, con revisión manual de los dudosos, porque el Excel no trae marca) → vista previa de diferencias → aplicar.
7. **Stock** — ajuste rápido (buscar → +/−), registrar entrada de mercancía, historial de movimientos por perfume (quién, cuándo, motivo).
8. **Pedidos** — estados Consulta → Confirmado → Entregado, o Cancelado; pago Pendiente/Pagado. Registrar pedido: cliente, WhatsApp opcional, perfumes + presentación + cantidad (precio del catálogo), descuento opcional, nota. Al confirmar descuenta stock; al cancelar lo devuelve.
9. **Datos del negocio** (Dueño) — nombre, eslogan, textos de portada, anuncios de la barra superior (lista reordenable), 3 sellos de confianza, contacto (teléfono, WhatsApp, correo, dirección, horario), redes. Mostrar dónde aparece cada texto en el catálogo público.
10. **Compartir catálogo** — link copiable, QR descargable, afiche imprimible tamaño carta, botón "Enviar por WhatsApp", y cómo instalar el catálogo como app.
11. **Usuarios** (Dueño) — lista, invitar (nombre + rol → link para mandar por WhatsApp), cambiar rol, desactivar.
12. **Historial** — cambios de precios, stock, perfumes y datos del negocio; filtro por persona y fecha; deshacer cambios recientes.

# 6. Datos de un perfume

| Campo | Reglas | Ejemplo |
|---|---|---|
| Marca | Obligatorio, con autocompletar | Valentino |
| Nombre | Obligatorio. Hay nombres de hasta ~60 caracteres | Le Beau Le Parfum Eau de Parfum Intense |
| Concentración | Lista editable (Eau de Parfum, Eau de Toilette, EDP Intense, Parfum, Extrait, Elixir…) | Eau de Parfum |
| Género | Hombre · Mujer · Unisex | Hombre |
| Familia | Amaderados · Florales · Frescos · Orientales · Frutales · Dulces | Orientales |
| Familia detallada | Texto libre, opcional | Oriental vainilla / aromático |
| Año | Opcional | 2023 |
| Perfumista | Opcional (vacío en la mayoría) | Antoine Maisondieu |
| Descripción | 100–230 caracteres, con contador | Vainilla bourbon y jengibre sobre vetiver ahumado… |
| Notas destacadas | Exactamente 3 (son los chips de la tarjeta) | Vainilla bourbon · Lavanda · Vetiver |
| Pirámide olfativa | Salida, Corazón, Fondo: cada una con 1 nota o más | Salida: Vainilla bourbon, Jengibre |
| Foto principal | Si falta, la web muestra una ilustración de frasco | Packshot sobre fondo claro |
| Foto ambiente | Opcional (hoy la tienen 11 de 132) | Foto de campaña |
| Presentaciones | Lista de {ml, precio, stock}. Normalmente 3/5/10 ml; puede haber solo 10 ml | 3 ml $220 · 5 ml $320 · 10 ml $550 |
| Destacado | Sí / No | Sí |
| Visible en catálogo | Sí / No. Ocultar no borra | Sí |
| Ficha por confirmar | Sí / No. La identificación es dudosa; la web muestra un aviso | No |
| Nombre en el Excel | Solo lectura, sirve para emparejar la importación | VALENTINO INTENSE |

**Validaciones:** precio entero mayor que 0; al menos una presentación; advertir sin bloquear si una presentación chica cuesta igual o más que una grande; no se puede eliminar un perfume con pedidos abiertos (ofrecer ocultarlo).

# 7. Reglas de negocio

- Estado de stock por presentación: 0 → Agotado · 1 a 3 → Últimas unidades · 4 o más → Disponible · sin dato → Sin registrar.
- "Desde $X" = precio más bajo entre las presentaciones.
- Formato de precio: `$1,250` (sin decimales).
- Un perfume agotado en todas sus presentaciones muestra la cinta "Agotado" y deja de mostrar "Destacado".
- Mensaje que genera la web por WhatsApp: "Hola, me interesa {nombre} de {marca} en {ml} ml. ¿Está disponible?"

# 8. Sin conexión y sincronización

- Indicador siempre visible, en 4 estados: "En línea · Todo sincronizado" · "Sin conexión · 3 cambios guardados en este dispositivo" · "Sincronizando…" · "No se pudo sincronizar · Reintentar".
- Cada elemento con cambios sin enviar lleva una marca discreta "Pendiente".
- Los ajustes de stock se guardan como movimientos (+2, −1), no como valor final: así dos personas no se pisan.
- Conflicto (dos personas cambiaron el mismo precio o texto sin conexión): mostrar ambos valores con autor y hora, y dejar elegir cuál queda. Nunca perder un cambio en silencio.
- Sin conexión se puede hacer todo excepto invitar usuarios e importar Excel (explicar por qué). Las fotos nuevas quedan en cola.

# 9. Estados obligatorios

Cargando (esqueleto, no spinner) · Vacío con la acción principal ("Importar desde Excel" / "Agregar primer perfume") · Sin resultados con "Limpiar filtros" · Error con qué hacer · Sin conexión · Sin permiso (vista de Empleado) · Cambios sin guardar (barra Guardar / Descartar y aviso al salir) · Validación junto al campo (color + ícono + texto) · Éxito con "Deshacer".

**Casos borde que tienen que aparecer:** nombre muy largo; perfume con solo 10 ml; ficha por confirmar; perfume sin foto; agotado; oculto; 5 ml al mismo precio que 3 ml; conflicto de sincronización.

# 10. Datos de muestra (reales — no inventes marcas)

| Marca | Nombre | Concentración | Género | Familia | Notas | 3 ml | 5 ml | 10 ml | Estado ficha | Destacado | Año |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Valentino | Uomo Born in Roma Intense | Eau de Parfum | Hombre | Orientales | Vainilla bourbon, Lavanda, Vetiver | 220 | 320 | 550 | ok | sí | 2023 |
| Valentino | Uomo Born in Roma Purple Melancholia | Eau de Toilette | Hombre | Amaderados | Cardamomo, Coco, Lavanda | — | — | 480 | ok | no | 2026 |
| Dior | Miss Dior | Eau de Parfum | Mujer | Florales | Rosa centifolia, Peonía, Vainilla | 220 | 320 | 550 | ok | sí | 2021 |
| Xerjoff | XJ 1861 Naxos | Eau de Parfum | Unisex | Dulces | Miel, Tabaco, Canela | 300 | 400 | 700 | ok | sí | 2015 |
| Nautica | Voyage | Eau de Toilette | Hombre | Frescos | Manzana, Loto, Cedro | 20 | 35 | 50 | ok | no | 2006 |
| Jean Paul Gaultier | Scandal Pour Homme Intense | Eau de Parfum Intense | Hombre | Amaderados | Salvia sclarea, Vetiver, Cuero | 180 | 180 | 300 | ok | no | 2025 |
| Afnan | 9 PM Rebel | Eau de Parfum | Hombre | Frutales | Piña, Manzana verde, Caramelo | 120 | 160 | 260 | por confirmar | no | 2024 |
| Rochas | Moustache Original 1949 | Eau de Toilette | Hombre | Frescos | Limón, Lavanda, Musgo | 100 | 140 | 200 | por confirmar | no | 2018 |
| Bharara | Rey de Reyes | Eau de Parfum | Hombre | Amaderados | Cardamomo, Lavanda, Sándalo | 110 | 150 | 240 | ok | no | — |
| Armaf | Club de Nuit Intense Man | Eau de Toilette | Hombre | Amaderados | Piña, Abedul, Ámbar gris | 70 | 100 | 150 | ok | no | 2015 |

El stock y los pedidos todavía no existen: inventa valores verosímiles (0 a 12 unidades por presentación, algunos agotados y otros en últimas unidades) y de 5 a 8 pedidos de ejemplo con nombres mexicanos comunes.

# 11. Fuera de alcance

Pagos en línea, carrito en el catálogo público, integración con la API de WhatsApp, facturación, reportes financieros avanzados, varias sucursales, idioma inglés y rediseño del catálogo público.

# 12. Textos de la interfaz

Español neutro de México, trato de tú. Botones con verbos concretos ("Guardar cambios", "Ocultar del catálogo", "Registrar pedido"). Sin jerga técnica: nada de "PWA", "SKU", "backend" ni "sync". Las confirmaciones nombran la acción ("Eliminar Miss Dior" / "Conservar"), nunca "¿Estás seguro?". Las acciones graves llevan resumen de lo que va a pasar y opción de deshacer.

# 13. Sistema visual (heredado del catálogo público)

**Personalidad:** formal y editorial, tipo boutique de perfumería. No debe parecer un SaaS genérico: nada de esquinas redondeadas, degradados, sombras de tarjeta ni colores chillones. El panel puede ser más denso que el catálogo, pero se reconoce como la misma marca.

**Colores (claro / oscuro):**

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| background | `#f4f2ee` | `#100f0d` | Fondo de página (nunca blanco puro) |
| surface | `#ffffff` | `#191714` | Tarjetas, tablas, paneles |
| surface-alt | `#eae6de` | `#221f1a` | Fondos secundarios, fila seleccionada |
| ink | `#14120f` | `#f2efe9` | Texto principal y botones primarios |
| muted | `#6f6862` | `#a19992` | Texto secundario, etiquetas |
| border | `#dcd6cc` | `#2f2b26` | Líneas finas y divisores |
| accent (dorado) | `#8a6a3b` | `#c9a66b` | Solo detalles: líneas, micro-etiquetas, íconos. Nunca botones |
| danger | `#8f3b2f` | `#d1705f` | Agotado, errores, acciones destructivas |
| success | `#3f6b4f` | `#6fa583` | Disponible, guardado, sincronizado |
| panel | `#14120f` | `#211e19` | Bloques oscuros |

El dorado sobre el fondo claro da 4.47:1 de contraste, apenas por debajo de AA: no lo uses para texto chico con información importante. Las fotos de producto conservan su fondo claro `#f7f5f2` en ambos temas.

**Tipografía:** Cormorant Garamond (300–600) solo en títulos grandes, nombre del negocio y cifras destacadas; nunca en tablas, formularios ni botones. Inter para toda la interfaz, con números tabulares en precios y stock. Micro-etiqueta ("eyebrow"): 11 px, mayúsculas, espaciado 0.2em, para encabezados de columna y etiquetas de estado. Texto base 14 px, tablas 13–14 px.

**Forma:** esquinas rectas en todo (`border-radius: 0`), salvo los puntos de estado circulares. Sin sombras de tarjeta: la jerarquía sale de líneas de 1 px y cambios de fondo. Contenedor de escritorio de hasta 1280 px con márgenes de 32 px; en celular, 16 px.

**Componentes del catálogo a reutilizar:** botón primario con fondo ink y texto claro (al pasar el mouse se invierte); botón secundario con borde ink; campos con borde fino y foco en ink; chips de nota con borde fino en mayúsculas 10 px; indicador de stock como punto de 6 px + etiqueta (verde Disponible, dorado Últimas unidades, rojo Agotado), nunca una píldora rellena; listas clave/valor con divisores finos; avisos con borde dorado al 30 % y fondo dorado al 6 %; íconos de línea con trazo 1.5.

**Adaptaciones para el panel:** tablas con filas de 48 px (modo compacto 40 px), encabezado fijo con micro-etiquetas, miniatura cuadrada de 40 px sobre `#f7f5f2`, precios y stock alineados a la derecha, fila seleccionada en surface-alt, sin cebra. Foco de teclado visible con contorno de 2 px. Acciones destructivas con borde danger y, en la confirmación final, fondo danger. Estados de sincronización como punto + texto, nunca solo color. En celular, barra inferior de pestañas y acción principal a lo ancho, abajo. Transiciones cortas (150–350 ms), sin animaciones decorativas.
