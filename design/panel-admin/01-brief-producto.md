# Brief — Panel de gestión del catálogo de decants

> Este documento se pega completo en el primer mensaje del proyecto en Claude Design (ver `LEEME.md`, paso 4).

## 1. Qué hay que diseñar

Un **panel de administración** para que un negocio de decants de perfume gestione su catálogo: perfumes, precios, stock, pedidos registrados a mano, datos del negocio y el link/QR con el que comparte el catálogo público.

- Funciona en **computadora y celular** y se instala como app.
- Idioma: español (México). Moneda: MXN.
- **No** hay que rediseñar el catálogo público: ya existe (capturas adjuntas en `capturas-sitio/`). El panel tiene que sentirse de la misma marca, pero es una herramienta de trabajo: prioriza claridad y rapidez sobre lo decorativo.

## 2. El negocio

- Vende **decants**: fracciones de 3, 5 y 10 ml envasadas a pedido desde frascos originales.
- Catálogo actual: **132 perfumes de 52 marcas** (Valentino, Dior, Lattafa, Armaf, Xerjoff, Afnan…). Hombre 79 · Mujer 25 · Unisex 28.
- Familias: Frescos 30 · Dulces 29 · Orientales 29 · Amaderados 24 · Frutales 14 · Florales 6.
- Precios hoy: 3 ml de $20 a $320 · 5 ml de $35 a $450 · 10 ml de $50 a $750.
- **No cobra en línea**: el cliente consulta por WhatsApp y el pedido se cierra ahí o en persona.
- Hoy los precios viven en un Excel (adjunto: columnas `NOMBRE | 10 ML | 5ML | 3ML`, nombres en mayúsculas y a veces sin marca). **No existe registro de stock ni de pedidos**: el panel es donde eso empieza.

## 3. Decisiones ya tomadas (no proponer alternativas)

| Tema | Decisión | Qué implica en el diseño |
|---|---|---|
| Catálogo público | Los datos viven en la nube. El catálogo es una app web instalable: se abre con un link o un QR y se puede ver sin internet (última versión descargada) | Pantalla **Compartir catálogo** (link, QR, afiche). Indicador de cuándo se actualizó el catálogo público |
| Panel sin internet | El panel **se usa sin conexión**: los cambios se guardan en el dispositivo y se sincronizan al volver | Indicador global de conexión, marcas de "pendiente", resolución de conflictos (sección 9) |
| Pedidos | Se **cargan a mano** en el panel (llegan por WhatsApp o en persona). Sin integración con WhatsApp | Flujo **Registrar pedido** muy rápido, pensado primero para celular |
| Permisos | Dos roles: **Dueño** y **Empleado** | Controles bloqueados según el rol, con el motivo visible |

## 4. Usuarios y permisos

- **Dueño (Alfredo)** — no técnico. Usa la computadora para cambios grandes (precios, altas de perfumes) y el celular para revisar y resolver rápido.
- **Empleado** — usa sobre todo el celular, en el mostrador o al preparar pedidos. Necesita: buscar un perfume, ajustar stock, registrar un pedido. Todo en pocos toques.

| Acción | Dueño | Empleado |
|---|---|---|
| Ver catálogo, precios y stock | ✓ | ✓ |
| Ajustar stock (entrada, salida, corrección) | ✓ | ✓ |
| Registrar y actualizar pedidos | ✓ | ✓ |
| Compartir el catálogo (link / QR) | ✓ | ✓ |
| Crear y editar perfumes (textos, fotos, notas), ocultarlos | ✓ | Solo lectura* |
| Cambiar precios (uno o masivo), importar Excel | ✓ | — |
| Eliminar perfumes | ✓ | — |
| Datos del negocio | ✓ | — |
| Usuarios e invitaciones | ✓ | — |
| Historial de cambios | Todo | Solo lo propio |

\* Supuesto a confirmar con el cliente. Lo que el empleado no puede hacer se muestra **bloqueado con el motivo** ("Solo el dueño puede cambiar precios"), no escondido sin explicación.

## 5. Plataformas y tamaños

- Escritorio: artboards de **1440 px** de ancho.
- Celular: artboards de **390×844**. Áreas táctiles de 44 px o más. Acciones principales al alcance del pulgar.
- Modo **claro y oscuro** (el catálogo público ya tiene ambos).

## 6. Módulos y pantallas

1. **Acceso** — iniciar sesión, aceptar invitación (link recibido por WhatsApp), recuperar acceso.
2. **Inicio** — resumen del día: perfumes agotados y con últimas unidades, pedidos pendientes, cambios sin sincronizar, cuándo se actualizó el catálogo público. Accesos rápidos: Registrar pedido, Ajustar stock, Nuevo perfume (Dueño), Compartir catálogo.
3. **Catálogo** — tabla en escritorio, lista en celular.
   - Búsqueda por nombre, marca o nota.
   - Filtros: género, familia, estado de stock, visible/oculto, destacado, "ficha por confirmar". Los filtros activos se ven siempre.
   - Orden: nombre, marca, precio, stock, última modificación.
   - Selección múltiple con acciones masivas: ocultar/mostrar, marcar destacado, cambiar precios.
   - Edición en línea solo de precio y stock; todo lo demás en la ficha.
4. **Ficha de perfume** (crear / editar) — panel lateral en escritorio (sin tapar la lista), pantalla completa en celular. Secciones: Identidad · Descripción y notas · Pirámide olfativa · Fotos · Presentaciones y precios · Stock · Visibilidad. Incluye **vista previa de la tarjeta** tal como se ve en el catálogo público.
5. **Precios masivos** — aumento o descuento (% o monto fijo) sobre una selección o un filtro, por presentación, con redondeo (múltiplos de 10 por defecto). Vista previa antes/después de cada precio, confirmación que dice cuántos perfumes cambian, y **deshacer**.
6. **Importar Excel de precios** — subir archivo → emparejar filas con perfumes (automático, con revisión manual de los dudosos, porque el Excel no trae marca) → vista previa de diferencias → aplicar.
7. **Stock** — ajuste rápido (buscar → +/−), registrar entrada de mercancía, historial de movimientos por perfume (quién, cuándo, motivo).
8. **Pedidos** — lista con estados: *Consulta → Confirmado → Entregado*, o *Cancelado*; pago *Pendiente / Pagado*.
   - Registrar pedido: cliente, WhatsApp opcional, perfumes + presentación + cantidad (precio tomado del catálogo), descuento opcional, nota.
   - Al confirmar se descuenta stock; al cancelar se devuelve.
9. **Datos del negocio** (Dueño) — nombre, eslogan, textos de portada, anuncios de la barra superior (lista reordenable), sellos de confianza (3), contacto (teléfono, WhatsApp, correo, dirección, horario), redes sociales. Mostrar **dónde aparece cada texto** en el catálogo público.
10. **Compartir catálogo** — link copiable, QR descargable, afiche imprimible para el mostrador (tamaño carta), botón "Enviar por WhatsApp", instrucción corta de cómo instalar el catálogo como app.
11. **Usuarios** (Dueño) — lista, invitar (nombre + rol → genera un link para mandar por WhatsApp), cambiar rol, desactivar.
12. **Historial** — cambios de precios, stock, perfumes y datos del negocio; filtro por persona y fecha; deshacer cambios recientes.

## 7. Datos de un perfume

| Campo | Reglas | Ejemplo |
|---|---|---|
| Marca | Obligatorio. Autocompletar con marcas existentes | Valentino |
| Nombre | Obligatorio. Hay nombres de hasta ~60 caracteres | Le Beau Le Parfum Eau de Parfum Intense |
| Concentración | Lista editable (Eau de Parfum, Eau de Toilette, EDP Intense, Parfum, Extrait, Elixir…) | Eau de Parfum |
| Género | Hombre · Mujer · Unisex | Hombre |
| Familia | Amaderados · Florales · Frescos · Orientales · Frutales · Dulces | Orientales |
| Familia detallada | Texto libre, opcional | Oriental vainilla / aromático |
| Año | Opcional | 2023 |
| Perfumista | Opcional (vacío en la mayoría) | Antoine Maisondieu y Guillaume Flavigny |
| Descripción | 100–230 caracteres, con contador | Vainilla bourbon y jengibre sobre un fondo de vetiver ahumado… |
| Notas destacadas | **Exactamente 3** (son los chips de la tarjeta) | Vainilla bourbon · Lavanda · Vetiver |
| Pirámide olfativa | Salida, Corazón, Fondo: cada una con 1 nota o más | Salida: Vainilla bourbon, Jengibre |
| Foto principal | Si falta, la web muestra una ilustración de frasco | Packshot sobre fondo claro |
| Foto ambiente | Opcional (hoy la tienen 11 de 132) | Foto de campaña |
| Presentaciones | Lista de {ml, precio, stock}. Normalmente 3 / 5 / 10 ml; puede haber solo 10 ml u otros tamaños | 3 ml $220 · 5 ml $320 · 10 ml $550 |
| Destacado | Sí / No | Sí |
| Visible en catálogo | Sí / No. **Ocultar no borra** | Sí |
| Ficha por confirmar | Sí / No. La identificación del perfume es dudosa; la web muestra un aviso | No |
| Nombre en el Excel | Solo lectura, sirve para emparejar la importación | VALENTINO INTENSE |

**Validaciones**
- Precio: entero mayor que 0, en MXN.
- Al menos una presentación.
- Advertir (sin bloquear) si una presentación chica cuesta igual o más que una grande.
- No se puede eliminar un perfume con pedidos abiertos: ofrecer ocultarlo.

## 8. Reglas de negocio (el panel las muestra igual que la web)

- **Estado de stock por presentación**: 0 → *Agotado* · 1 a 3 → *Últimas unidades* · 4 o más → *Disponible*. Sin dato cargado → *Sin registrar* (la web no muestra disponibilidad).
- **"Desde $X"** = precio más bajo entre las presentaciones.
- **Formato de precio**: `$1,250` (sin decimales).
- Un perfume agotado en todas sus presentaciones muestra la cinta *Agotado* y deja de mostrar *Destacado*.
- Mensaje que genera la web por WhatsApp: "Hola, me interesa {nombre} de {marca} en {ml} ml. ¿Está disponible?"
- **Decisión abierta — cómo se cuenta el stock.** Diseñar la variante A (unidades por presentación, como la web hoy) y la variante B (ml restantes del frasco original; las presentaciones disponibles se calculan solas) para que el cliente elija.

## 9. Sin conexión y sincronización

- **Indicador siempre visible** (discreto):
  - *En línea · Todo sincronizado*
  - *Sin conexión · 3 cambios guardados en este dispositivo*
  - *Sincronizando…*
  - *No se pudo sincronizar · Reintentar*
- Cada elemento con cambios aún no enviados lleva una marca discreta **Pendiente**.
- Los ajustes de stock se guardan como **movimientos** (+2, −1), no como un valor final: así dos personas pueden ajustar el mismo perfume sin pisarse.
- **Conflicto** (dos personas cambiaron el mismo precio o texto sin conexión): mostrar ambos valores con autor y hora y dejar elegir cuál queda. Nunca perder un cambio en silencio.
- Sin conexión se puede hacer todo excepto invitar usuarios e importar Excel (explicar por qué). Las fotos nuevas quedan en cola y se suben al volver la conexión.

## 10. Estados obligatorios

En cada pantalla que aplique:
- **Cargando**: esqueleto, no spinner.
- **Vacío**, con la acción principal: "Importar desde Excel" / "Agregar primer perfume".
- **Sin resultados**, con "Limpiar filtros".
- **Error**, con qué hacer.
- **Sin conexión**.
- **Sin permiso** (vista de Empleado).
- **Cambios sin guardar**: barra con *Guardar* / *Descartar* y aviso al salir.
- **Validación junto al campo**: al salir del campo, con color + ícono + texto.
- **Éxito con deshacer**.

**Casos borde que tienen que aparecer:**
- Nombre muy largo.
- Perfume con solo 10 ml.
- Ficha por confirmar.
- Perfume sin foto.
- Agotado y oculto.
- 5 ml con el mismo precio que 3 ml.
- Conflicto de sincronización.

## 11. Datos de muestra (reales — no inventar marcas)

Fotos de 6 de estos perfumes en `fotos-producto/`. El Excel completo va adjunto.

| Marca | Nombre | Concentración | Género | Familia | Notas (chips) | 3 ml | 5 ml | 10 ml | Completitud | Destacado | Año |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Valentino | Uomo Born in Roma Intense | Eau de Parfum | Hombre | Orientales | Vainilla bourbon, Lavanda, Vetiver | 220 | 320 | 550 | alta | sí | 2023 |
| Valentino | Uomo Born in Roma Purple Melancholia | Eau de Toilette | Hombre | Amaderados | Cardamomo, Coco, Lavanda | — | — | 480 | alta | no | 2026 |
| Dior | Miss Dior | Eau de Parfum | Mujer | Florales | Rosa centifolia, Peonía, Vainilla | 220 | 320 | 550 | alta | sí | 2021 |
| Xerjoff | XJ 1861 Naxos | Eau de Parfum | Unisex | Dulces | Miel, Tabaco, Canela | 300 | 400 | 700 | alta | sí | 2015 |
| Nautica | Voyage | Eau de Toilette | Hombre | Frescos | Manzana, Loto, Cedro | 20 | 35 | 50 | alta | no | 2006 |
| Jean Paul Gaultier | Scandal Pour Homme Intense | Eau de Parfum Intense | Hombre | Amaderados | Salvia sclarea, Vetiver, Cuero | 180 | 180 | 300 | media | no | 2025 |
| Afnan | 9 PM Rebel | Eau de Parfum | Hombre | Frutales | Piña, Manzana verde, Caramelo | 120 | 160 | 260 | baja (por confirmar) | no | 2024 |
| Rochas | Moustache Original 1949 | Eau de Toilette | Hombre | Frescos | Limón, Lavanda, Musgo | 100 | 140 | 200 | baja (por confirmar) | no | 2018 |
| Bharara | Rey de Reyes | Eau de Parfum | Hombre | Amaderados | Cardamomo, Lavanda, Sándalo | 110 | 150 | 240 | media | no | — |
| Armaf | Club de Nuit Intense Man | Eau de Toilette | Hombre | Amaderados | Piña, Abedul, Ámbar gris | 70 | 100 | 150 | alta | no | 2015 |

El stock y los pedidos todavía no existen. Inventar valores verosímiles:
- Stock de 0 a 12 unidades por presentación, con algunos agotados y otros en últimas unidades.
- De 5 a 8 pedidos de ejemplo con nombres mexicanos comunes y estados variados.

## 12. Fuera de alcance

- Pagos en línea y carrito en el catálogo público.
- Integración con la API de WhatsApp.
- Facturación y reportes financieros avanzados.
- Varias sucursales.
- Idioma inglés.
- Rediseño del catálogo público.

## 13. Textos de la interfaz

- Español neutro de México, trato de **tú**.
- Botones con verbos concretos: "Guardar cambios", "Ocultar del catálogo", "Registrar pedido".
- Sin jerga técnica: nada de "PWA", "SKU", "backend" ni "sync".
- Confirmaciones que nombran la acción ("Eliminar Miss Dior" / "Conservar"), **nunca** "¿Estás seguro?".
- Acciones graves (eliminar, cambio masivo de precios) con resumen de lo que va a pasar y opción de deshacer.
