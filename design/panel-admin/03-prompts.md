# Prompts para Claude Design — en orden

**Cómo usarlos**
- Un prompt por mensaje. Esperá el resultado y revisalo antes de pasar al siguiente.
- Cambios puntuales: **comentario sobre el elemento** en el canvas. Cambios generales: por el chat.
- Antes de cualquier cambio grande, pedí **"Guardá esta versión"**.
- Si algo sale mal, corregilo antes de avanzar: cada pantalla nueva copia los errores de la anterior.

---

## P0 — Contexto (primer mensaje)

Adjuntá antes: las 6 imágenes de `adjuntos/capturas-sitio/`, las 6 de `adjuntos/fotos-producto/` y `adjuntos/INVENTARIO_ESENCIAS_POR_ML_final.xlsx`.

```
Vamos a diseñar un panel de administración para un negocio de decants de perfume.
Te adjunto: capturas del catálogo público que ya existe (capturas-sitio), fotos
reales de producto (fotos-producto) y el Excel real de precios.

Abajo va el brief completo y después el sistema visual que tiene que respetar.

Antes de diseñar nada:
1. Resume en 10 puntos lo que entendiste.
2. Lista dudas o contradicciones que veas.
3. Propón la lista de artboards que vas a crear (nombre en español + tamaño).
No generes pantallas todavía.

=== BRIEF ===
[PEGAR AQUÍ TODO 01-brief-producto.md]

=== SISTEMA VISUAL ===
[PEGAR AQUÍ TODO 02-sistema-visual.md — omitir si ya importaste el sistema de diseño]
```

Respondé sus dudas en el chat antes de seguir.

---

## P1 — Estructura y navegación (3 variantes)

```
Diseña la estructura base del panel en 3 variantes de navegación. Cada variante
en escritorio (1440×900) y celular (390×844), con la pantalla Inicio como contenido:

- Variante A: barra lateral fija en escritorio + pestañas inferiores en celular.
- Variante B: barra superior en escritorio + pestañas inferiores en celular.
- Variante C: la que consideres mejor para un dueño no técnico y empleados en mostrador.

En todas: nombre del negocio, usuario con su rol (Dueño), indicador de
conexión/sincronización, y acceso rápido a "Registrar pedido".
Pestañas del celular: Inicio · Catálogo · Pedidos · Stock · Más.

Inicio muestra: agotados, últimas unidades, pedidos pendientes, cambios sin
sincronizar, "Catálogo público actualizado hace 5 min", y accesos rápidos.

Respeta el sistema visual: esquinas rectas, neutros cálidos, negro tinta para
acciones, dorado solo como detalle, Cormorant solo en títulos, Inter en la interfaz.
Nombra los artboards "P1 Inicio — escritorio — A", etc.
```

Después de elegir:

```
Me quedo con la variante [A/B/C]. Ajustes: [...].
Borra las otras dos y usa esta como base para todas las pantallas siguientes.
```

---

## P2 — Catálogo (lista de perfumes)

```
Diseña la pantalla Catálogo sobre la estructura elegida.

Escritorio (1440): tabla con columnas en este orden: foto + nombre y marca,
género, familia, "Desde $", precio 3/5/10 ml, stock por presentación (punto +
número), visible, última modificación. Encabezado fijo.
- Arriba: búsqueda (nombre, marca o nota), filtros (género, familia, estado de
  stock, visible/oculto, destacado, ficha por confirmar) con los filtros activos
  siempre visibles como chips removibles, orden, y botón "Nuevo perfume".
- Selección múltiple: al seleccionar aparece una barra con el conteo
  ("12 seleccionados"), "Seleccionar los 132", y acciones: Cambiar precios,
  Ocultar/Mostrar, Marcar destacado.
- Precio y stock se editan en la misma celda (doble clic): la fila cambia de
  aspecto en modo edición, guardar/cancelar, validación en la celda.

Celular (390): lista de tarjetas compactas (foto, nombre, marca, "Desde $",
estado de stock), búsqueda arriba, filtros en hoja inferior.

Usa los 10 perfumes reales del brief (con sus fotos) y completa hasta ~20 filas
con otros perfumes verosímiles de marcas reales. Incluye en la tabla: el nombre
más largo, uno con solo 10 ml, uno agotado, uno oculto y uno "por confirmar".
Artboards extra: estado cargando (esqueleto) y sin resultados.
```

---

## P3 — Ficha de perfume (crear / editar)

```
Diseña la ficha de perfume para editar "Uomo Born in Roma Intense" de Valentino.

Escritorio: panel lateral a la derecha (~560 px) que no tapa la lista del catálogo.
Celular: pantalla completa con botón "Guardar cambios" fijo abajo.

Secciones: Identidad (marca con autocompletar, nombre, concentración, género,
familia, familia detallada, año, perfumista) · Descripción (contador 100–230) y
3 notas destacadas · Pirámide olfativa (Salida / Corazón / Fondo, agregar y
quitar notas) · Fotos (principal y ambiente: subir, reemplazar, recortar) ·
Presentaciones (filas ml / precio / stock, agregar tamaño) · Visibilidad
(visible, destacado, ficha por confirmar).

Incluye:
- Vista previa de la tarjeta tal como se ve en el catálogo público (usa la captura).
- Barra "Cambios sin guardar" con Guardar / Descartar.
- Errores de validación junto al campo (nombre vacío, precio 0, faltan notas).
- Advertencia no bloqueante: "5 ml cuesta lo mismo que 3 ml".
- Zona inferior: "Ocultar del catálogo" (secundario) y "Eliminar perfume"
  (destructivo, con confirmación que nombra el perfume).
- Artboard extra "Nuevo perfume" vacío, y la misma ficha vista por un Empleado:
  campos de solo lectura con candado y el motivo, pero stock editable.
```

---

## P4 — Precios masivos e importación de Excel

```
Diseña dos flujos solo para el Dueño, en escritorio y celular:

1) Cambiar precios en masa (desde la selección del Catálogo):
   Paso 1 — qué cambiar: aumentar / disminuir, % o monto fijo, en qué
   presentaciones (3/5/10 ml), redondeo (múltiplos de 10 por defecto).
   Paso 2 — vista previa: tabla antes → después por perfume y presentación,
   destacando los que quedan con precios incoherentes.
   Paso 3 — confirmación: "Actualizar precios de 12 perfumes", no "¿Estás seguro?".
   Resultado: aviso de éxito con "Deshacer".
   Ejemplo: +10 % a todos los Lattafa, redondeo a 10.

2) Importar Excel de precios (archivo con columnas NOMBRE | 10 ML | 5ML | 3ML,
   nombres en mayúsculas y a veces sin marca, ej. "VALENTINO INTENSE", "9 AM"):
   subir → emparejar filas con perfumes (automáticas en verde, dudosas para
   elegir a mano, nuevas sin coincidencia) → diferencias de precio → aplicar.
```

---

## P5 — Stock

```
Diseña la sección Stock, pensando primero en un empleado con el celular en el mostrador.

- Ajuste rápido: buscar perfume → ver sus presentaciones → botones − / + grandes
  y motivo opcional (venta en persona, merma, corrección). Objetivo: 3 toques.
- Registrar entrada de mercancía (varios perfumes a la vez).
- Historial de movimientos de un perfume: +2 / −1, quién, cuándo, motivo.
- Vista general en escritorio: lista filtrada por Agotado / Últimas unidades /
  Sin registrar.

Decisión abierta del cliente: muestra DOS variantes del ajuste rápido.
- Variante A: stock en unidades por presentación (3 ml: 4 · 5 ml: 2 · 10 ml: 0).
- Variante B: ml restantes del frasco original (quedan 38 ml), y el sistema
  indica cuántos decants de cada tamaño alcanzan.
Estados: 0 = Agotado, 1–3 = Últimas unidades, 4+ = Disponible, vacío = Sin registrar.
```

---

## P6 — Pedidos

```
Diseña Pedidos (carga manual: los pedidos llegan por WhatsApp o en persona).

- Lista con filtros por estado (Consulta, Confirmado, Entregado, Cancelado) y
  pago (Pendiente, Pagado). En celular: tarjetas.
- "Registrar pedido", pensado primero para celular y para hacerse en menos de
  un minuto: cliente (nombre, WhatsApp opcional) → agregar perfumes (buscar,
  elegir presentación y cantidad; el precio sale del catálogo; muestra stock
  disponible) → descuento opcional → nota → total → Guardar.
- Detalle del pedido: cambiar estado, marcar pagado, botón "Abrir chat de WhatsApp".
- Aviso al confirmar: "Se descontarán 3 unidades del stock". Al cancelar: "Se
  devolverán al stock".
- Caso: intentar agregar una presentación agotada.
Usa 6 pedidos de ejemplo con nombres mexicanos comunes y los perfumes del brief.
```

---

## P7 — Datos del negocio y Compartir catálogo

```
Diseña dos pantallas:

1) Datos del negocio (solo Dueño): nombre, eslogan, titular de portada (parte
   destacada + resto), texto de introducción, anuncios de la barra superior
   (lista reordenable, agregar/quitar), 3 sellos de confianza (título + texto),
   contacto (teléfono, WhatsApp, correo, dirección, horario), Instagram y
   Facebook. Al lado, una miniatura del catálogo público que resalta dónde
   aparece el campo que se está editando.

2) Compartir catálogo (Dueño y Empleado): link corto copiable, QR grande con
   "Descargar QR", "Afiche para imprimir" (vista previa carta: nombre del
   negocio, QR, "Escanea y mira el catálogo"), botón "Enviar por WhatsApp", y
   una explicación de 3 pasos de cómo instalar el catálogo como app en el
   celular. Muestra "Última actualización publicada: hoy 10:42".
```

---

## P8 — Acceso, usuarios y vista de Empleado

```
Diseña:
1) Iniciar sesión (simple, marca del negocio arriba), aceptar invitación
   ("Alfredo te invitó como Empleado" → crear contraseña) y recuperar acceso.
2) Usuarios (solo Dueño): lista con rol y estado, "Invitar" (nombre + rol →
   genera link y botón "Enviar por WhatsApp"), cambiar rol, desactivar.
3) Recorrido de Empleado en celular: Inicio, Catálogo, Pedidos y Stock tal como
   los ve un empleado. Lo que no puede hacer aparece bloqueado con el motivo
   ("Solo el dueño puede cambiar precios"), nunca como un error sorpresa.
```

---

## P9 — Sin conexión y sincronización

```
Diseña el comportamiento sin internet del panel (se puede seguir trabajando y
se sincroniza al volver). En escritorio y celular:

- Indicador global en sus 4 estados: "En línea · Todo sincronizado",
  "Sin conexión · 3 cambios guardados en este dispositivo", "Sincronizando…",
  "No se pudo sincronizar · Reintentar".
- Filas y fichas con marca "Pendiente".
- Panel "Cambios pendientes": lista de lo que falta enviar.
- Conflicto: dos personas cambiaron el precio de 10 ml de Miss Dior sin conexión
  ($550 → $580 por Alfredo 10:15, $550 → $600 por Luis 10:22). Pantalla para
  elegir cuál queda, con autor y hora. El stock no genera conflictos porque se
  suma como movimiento: muéstralo con un aviso informativo.
- Acciones que requieren conexión (invitar usuario, importar Excel), deshabilitadas
  con el motivo. Fotos subidas sin conexión: "En cola, se subirán al reconectar".
```

---

## P10 — Estados y modo oscuro

```
Revisa todas las pantallas y agrega los estados que falten, como artboards
separados: cargando (esqueleto), vacío con acción principal ("Importar desde
Excel" / "Agregar primer perfume"), sin resultados con "Limpiar filtros", error
con qué hacer, y éxito con "Deshacer".

Después, crea la versión en modo oscuro de: Inicio, Catálogo (escritorio),
Ficha de perfume y Registrar pedido (celular), usando los tokens oscuros del
sistema visual. Las fotos conservan su fondo claro #f7f5f2.
```

---

## P11 — Revisión de usabilidad y accesibilidad

```
Haz una revisión crítica de todo el panel, como si fueras un experto en
usabilidad y accesibilidad (WCAG 2.2 AA):
1. Contraste de texto e íconos (ojo: el dorado #8a6a3b sobre #f4f2ee da 4.47:1).
2. Tamaño de áreas táctiles en celular (mínimo 44 px).
3. Foco visible y orden de teclado en escritorio.
4. Estados que dependen solo del color.
5. Textos confusos para una persona no técnica.
6. Inconsistencias entre pantallas (nombres de botones, estilos, espaciados).
7. Tareas clave: ¿cuántos toques/clics lleva cada una? Ajustar stock,
   registrar pedido, subir 10 % los precios de una marca, compartir el catálogo.
Entrega una lista priorizada de problemas y corrígelos en el canvas.
```

---

## P12 — Entrega para desarrollo

```
Prepara la entrega para desarrollo:
- Página "Índice" con todas las pantallas agrupadas por módulo y el flujo entre ellas.
- Página "Componentes": botones, campos, tabla, fila en edición, tarjeta de
  perfume, indicador de stock, indicador de sincronización, barra de selección,
  barra de cambios sin guardar, avisos, confirmaciones, pestañas, hoja inferior.
  Todos con sus estados (normal, hover, foco, deshabilitado, error).
- Página "Tokens": colores claro/oscuro, tipografía, espaciados.
Después genera el paquete de entrega para Claude Code.
```

---

## Correcciones rápidas útiles

- "Esto se ve como un SaaS genérico: vuelve a esquinas rectas, sin sombras, más aire y líneas finas como en las capturas del catálogo."
- "El dorado se está usando en botones: los botones son negro tinta; el dorado queda solo en detalles."
- "Esta pantalla usa datos inventados: reemplázalos por los perfumes reales del brief."
- "En celular esto requiere demasiados toques: reduce el flujo a [N] pasos."
- "Muéstrame 2 alternativas de este componente lado a lado antes de aplicarlo a todo."
