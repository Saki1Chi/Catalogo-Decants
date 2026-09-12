# Paquete para diseñar el panel de gestión en Claude Design

Todo lo necesario para pedirle a Claude Design el panel donde Alfredo y sus empleados gestionan el catálogo de decants (perfumes, precios, stock, pedidos, datos del negocio y compartir el catálogo).

## Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `01-brief-producto.md` | El brief completo: negocio, decisiones, roles, pantallas, datos, reglas, estados. Se pega en el primer mensaje |
| `02-sistema-visual.md` | Colores, tipografías y reglas visuales heredadas del catálogo público |
| `03-prompts.md` | 13 prompts en orden (P0 a P12) para copiar y pegar, más frases de corrección |
| `04-checklist-revision.md` | Para revisar el resultado antes de darlo por bueno |
| `adjuntos/capturas-sitio/` | 6 capturas PNG del catálogo público real (escritorio y celular) |
| `adjuntos/fotos-producto/` | 6 fotos PNG de perfumes reales usados en los datos de muestra |
| `adjuntos/INVENTARIO_ESENCIAS_POR_ML_final.xlsx` | Copia del Excel real de precios |

**No usar** los mockups viejos de la raíz de `design/` (`Main`, `Detail`, `Mobile.dc.html`): son un borrador descartado con otro estilo.

## Antes de empezar

- Claude Design está en **claude.ai/design** (o en la barra lateral de Claude Desktop). Pide plan Pro, Max, Team o Enterprise.
- **No funciona en el celular**: hacelo desde la PC.
- Consume el mismo límite de uso que el chat y Claude Code.
- No funciona bien con varias personas editando a la vez: trabajalo vos solo.

## Paso a paso

1. **Crear el proyecto** en claude.ai/design: "Panel de gestión — Decants".
2. **Sistema de diseño.** Tres opciones, de mejor a más simple:
   - **A.** Configurar el sistema de diseño en Claude Design subiendo el código del sitio: `src/app/globals.css`, `src/app/layout.tsx` y la carpeta `src/components/`. Revisar lo que genera y activarlo como publicado. *Según la documentación, esto se gestiona a nivel organización y puede pedir permisos de admin; en una cuenta individual puede no estar disponible.*
   - **B.** Pedirme desde Claude Code que lo sincronice con la herramienta de sincronización de sistemas de diseño (necesita tu aprobación, porque escribe en tu cuenta de claude.ai).
   - **C.** Si no se puede ninguna de las dos: pegar `02-sistema-visual.md` en el primer mensaje (el prompt P0 ya lo contempla).
3. **Adjuntar** las 12 imágenes de `adjuntos/` y el Excel.
4. **Primer mensaje:** prompt **P0** de `03-prompts.md`, con el brief pegado donde indica. Claude Design no diseña todavía: resume lo que entendió y hace preguntas. Respondelas.
5. **P1:** elegí una de las 3 variantes de navegación. Es la decisión que más impacta en el resto.
6. **P2 a P9**, uno por mensaje, revisando cada resultado. Correcciones puntuales con comentarios sobre el elemento; generales por el chat.
7. **P10** (estados y modo oscuro) y **P11** (revisión de usabilidad y accesibilidad).
8. **Revisar con `04-checklist-revision.md`.**
9. **P12:** entrega. Exportar un **PDF** para mostrarle a Alfredo y el **paquete de entrega para Claude Code**. Guardar ambos en `design/panel-admin/entregas/`.

**Consejos**
- Pedí "Guardá esta versión" antes de cada cambio grande.
- Si una pantalla sale mal, corregila antes de seguir: las siguientes copian sus errores.
- Ante una duda de diseño, pedí 2–3 alternativas lado a lado en vez de describir la solución.

## Decisiones tomadas (ya están en el brief)

- Catálogo público: app web instalable con datos en la nube, compartible por link y QR, visible sin internet.
- Panel: funciona sin conexión y sincroniza al volver.
- Pedidos: carga manual en el panel.
- Permisos: Dueño y Empleado.

## Decisiones abiertas — conviene definirlas con Alfredo

1. **Cómo se cuenta el stock**: unidades por presentación (como la web hoy) o ml restantes del frasco original. El prompt P5 pide ambas variantes para mostrárselas.
2. **Qué edita el Empleado**: el brief supone que solo stock y pedidos, sin tocar textos, fotos ni precios.
3. **Trato en los textos**: el panel está pedido en español de México con "tú". El catálogo público hoy usa voseo ("conocés", "Probá"); si los clientes son de México, conviene unificarlo.

## Después del diseño

Con el paquete de entrega de Claude Design, el desarrollo sigue en Claude Code. Antes de escribir código hay que definir el servicio de nube y cómo se sincroniza sin conexión. El sitio actual es estático (`output: "export"`) y el script que generaba `src/data/perfumes.ts` desde el inventario ya no está en disco: los 132 `datos.json` de `Recursos_pagina_alfredo/inventario/` y el Excel serían la importación inicial a la base de datos.
