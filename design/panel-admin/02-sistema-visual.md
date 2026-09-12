# Sistema visual — heredado del catálogo público

> Fuente de verdad: `src/app/globals.css`, `src/app/layout.tsx` y `src/components/` de este proyecto.
> Si Claude Design no puede importar el código como sistema de diseño, pegá este documento en el chat (ver `LEEME.md`, paso 2).
>
> **No usar** como referencia los mockups viejos de `design/Main.dc.html`, `Detail.dc.html` y `Mobile.dc.html`: son un borrador descartado (Playfair Display, esquinas redondeadas, botón verde). La referencia válida son las capturas de `adjuntos/capturas-sitio/`.

## Personalidad

Formal y editorial, tipo boutique de perfumería. **No** tiene que parecer un SaaS genérico: nada de esquinas redondeadas, degradados, sombras de tarjeta ni colores chillones. El panel sí puede ser más denso y utilitario que el catálogo, pero tiene que reconocerse como la misma marca.

## Colores (tokens)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `background` | `#f4f2ee` | `#100f0d` | Fondo de página (nunca blanco puro) |
| `surface` | `#ffffff` | `#191714` | Tarjetas, tablas, paneles |
| `surface-alt` | `#eae6de` | `#221f1a` | Fondos secundarios, filas seleccionadas, avisos |
| `ink` | `#14120f` | `#f2efe9` | Texto principal y **botones primarios** |
| `muted` | `#6f6862` | `#a19992` | Texto secundario, etiquetas |
| `border` | `#dcd6cc` | `#2f2b26` | Líneas finas, divisores |
| `line-strong` | `#c6bdaf` | `#46403a` | Bordes con más presencia |
| `accent` (dorado) | `#8a6a3b` | `#c9a66b` | **Solo detalles**: líneas, micro-etiquetas, íconos de acento. Nunca botones |
| `danger` | `#8f3b2f` | `#d1705f` | Agotado, errores, acciones destructivas |
| `success` | `#3f6b4f` | `#6fa583` | Disponible, guardado, sincronizado |
| `panel` | `#14120f` | `#211e19` | Bloques oscuros (barra superior, pie) |
| `scrim` | `rgba(20,18,15,.5)` | `rgba(0,0,0,.72)` | Fondo detrás de modales |
| Fondo de foto | `#f7f5f2` | `#f7f5f2` | Fondo fijo de las fotos de producto, en ambos temas |

**Contraste (calculado con la fórmula WCAG):**
- `muted` sobre `background`: 4.9:1 ✓
- `accent` sobre `background`: **4.47:1**, apenas por debajo de AA (4.5:1) para texto chico. En el panel, el dorado no lleva información importante en texto de menos de 18 px. Sobre `surface` blanco sí pasa (5.0:1).

## Tipografía

- **Cormorant Garamond** (300–600): solo títulos grandes de página, nombre del negocio y cifras destacadas del Inicio. **Nunca** en tablas, formularios ni botones.
- **Inter**: toda la interfaz. En tablas y precios usar números tabulares (`tabular-nums`).
- **Micro-etiqueta ("eyebrow")**: 11 px, mayúsculas, espaciado 0.2em. Para encabezados de columna, secciones y etiquetas de estado.
- Tamaños base del panel: texto 14 px, tablas 13–14 px, etiquetas de campo 12 px.

## Forma y espacio

- **Esquinas rectas en todo** (`border-radius: 0`). Excepción única: puntos de estado circulares.
- Sin sombras de tarjeta. La jerarquía sale de líneas finas (`border`) y de cambios de fondo (`surface` / `surface-alt`).
- Grillas con separadores de 1 px (patrón del catálogo: `gap 1px` sobre fondo `border`).
- Contenedor de escritorio: máx. 1280 px con márgenes de 32 px. Celular: márgenes de 16 px.

## Componentes que ya existen en el catálogo (reutilizar el estilo)

| Componente | Cómo se ve |
|---|---|
| Botón primario | Fondo `ink`, texto `background`, micro-etiqueta. Hover: se invierte (transparente + borde `ink`) |
| Botón secundario | Borde `ink`, texto `ink`. Hover: fondo `ink` |
| Campo de texto / select | Borde `border`, fondo `surface`, 13 px, padding 12×16. Foco: borde `ink` |
| Chip de nota | Borde `border`, 10 px mayúsculas, `muted` |
| Indicador de stock | **Punto** de 6 px + micro-etiqueta (no una píldora rellena): verde *Disponible*, dorado *Últimas unidades*, rojo *Agotado* |
| Cinta de tarjeta | "Destacado" en `ink`, "Agotado" en `danger` (Agotado reemplaza a Destacado) |
| Lista clave/valor | Filas de 3 columnas con divisores finos (ficha técnica) |
| Aviso | Borde dorado al 30 % + fondo dorado al 6 % ("Por confirmar") |
| Título de sección | Micro-etiqueta dorada + título Cormorant light + línea dorada de 44×1 px |
| Iconos | Línea fina (trazo 1.5), sin relleno |

## Adaptaciones para el panel (nuevas, coherentes con lo anterior)

- **Tablas**: filas de 48 px (modo compacto de 40 px), encabezado fijo con micro-etiquetas en `muted`, miniatura cuadrada de 40 px sobre `#f7f5f2`, precios y stock alineados a la derecha con números tabulares. Fila seleccionada en `surface-alt`. Sin cebra.
- **Foco visible**: además del borde `ink`, un contorno de 2 px `ink` con separación de 2 px, para teclado (el catálogo lo tiene muy sutil; en el panel no alcanza).
- **Destructivo**: botón con borde `danger` y, en la confirmación final, fondo `danger`.
- **Estados de sincronización**: punto + texto, igual que el stock (verde sincronizado, dorado pendiente, rojo error). Nunca solo color: siempre con texto o ícono.
- **Celular**: barra inferior de pestañas sobre `surface` con borde superior fino. Botón de acción principal en `ink`, a lo ancho, pegado abajo cuando hay un formulario.
- **Modo oscuro**: mismos tokens de la tabla. Las fotos de producto conservan su fondo claro `#f7f5f2`.
- **Movimiento**: transiciones cortas (150–350 ms, `cubic-bezier(0.16,1,0.3,1)`). Nada de animaciones decorativas en el panel.
