# Backend real (Fase 2) — decisiones y arquitectura

Este documento cierra el vacío que dejaba `LEEME.md`: *"Antes de escribir
código hay que definir el servicio de nube y cómo se sincroniza sin
conexión."* El prototipo (`src/app/panel/**`, `src/panel/**`) ya tenía toda
la UX resuelta sobre `localStorage`; esto documenta qué reemplazó esa capa.

## Decisión: Firebase (Firestore + Storage + Auth)

No es una elección entre opciones equivalentes: el brief ya le prometió al
cliente panel offline-first con sync automático (sección 9). Firestore trae
esto nativo — cache persistente en IndexedDB, listeners en tiempo real que
siguen funcionando sin red, cola de escrituras que reintenta sola al
reconectar — que es exactamente lo que `store.tsx` *simulaba* antes con un
`setTimeout(1400ms)`. Supabase (Postgres) no tiene un equivalente de
fábrica (exigiría sumar PowerSync/ElectricSQL). Un backend propio implica un
servidor que mantener, lo que el proyecto evita a propósito con
`output: "export"` (que **sigue vigente** — Firebase se usa 100% por SDK
cliente, sin API routes).

Costo esperado con este volumen (132 perfumes, pocas fotos nuevas por mes,
1-5 usuarios de panel, tráfico bajo): **$0 USD/mes**, dentro de la capa
gratis de Firebase. Configurar una alerta de billing en Google Cloud (~$5
USD) para detectar cualquier configuración errónea temprano.

## Modelo de datos (Firestore)

Se abandonó el patrón "overrides sobre `perfumes.ts`" (existía solo porque
ese archivo es generado e inmutable) — cada perfume es ahora un documento
completo y mutable. Colecciones, todas a nivel superior (sin subcolecciones,
para evitar collection-group indexes):

- `perfumes/{id}` — ficha completa (`src/types.ts::Perfume`) + campos de
  gestión (`visible`, `destacado`, `fichaPorConfirmar`, `eliminado`,
  `imagenEsPlaceholder`, `origen`, `version`, `modificadoEn`, `modificadoPor`).
- `movimientosStock/{id}` — ledger append-only (`perfumeId`, `ml`, `delta`,
  `autor`, `fecha`). El campo `tamanos[].stock` de `perfumes/{id}` es un
  agregado que recalcula `functions/src/index.ts::recalcularStock` —
  el cliente nunca lo escribe directo (así dos dispositivos offline no se
  pisan un +1/-1).
- `pedidos/{id}`, `historial/{id}`, `usuarios/{uid}` (doc id = uid de Auth),
  `invitaciones/{email}` (reserva de rol antes del primer login),
  `negocio/config`, `meta/catalogo` (agregado, lo mantiene una función),
  `conflictos/{id}` (ver más abajo).

Reglas reales en `firestore.rules` / `storage.rules` — reemplazan los
controles que hoy son solo de UI (un Empleado "no ve" el botón, pero antes
nada se lo impedía a nivel de datos).

## Fotos

El panel sube el original a `perfumes-raw/{id}/{principal|ambiente}.*`;
`functions/src/index.ts::procesarFotoPerfume` genera la versión WebP
optimizada en `perfumes/{id}/...` (mismos anchos que ya usaba
`public/perfumes/`: 700px card, 1200px ambiente) y actualiza la ficha sola.
Las fotos migradas desde `inventario/` son de cada marca (sin derechos para
producción, ver `inventario/README.md`) — quedan marcadas
`imagenEsPlaceholder: true` con un aviso en la ficha hasta que Alfredo sube
una propia. Subida offline: cola persistida en IndexedDB
(`src/panel/colaFotos.ts`), reintenta sola al reconectar.

## Migración inicial

`scripts/migrar-inventario.ts` (correr una sola vez, con
`FIREBASE_SERVICE_ACCOUNT_PATH` en `.env.local`): recorre los 132
`inventario/*/*/datos.json`, cruza precios contra el Excel por `fila_excel`,
sube los `.webp` ya optimizados de `public/perfumes/` a Storage, y escribe
los documentos en batches. Idempotente (`--dry-run`, `--force`). Las
carpetas de `inventario/` quedan congeladas como respaldo histórico después
de esto — el panel pasa a ser la única fuente viva.

## Auth

Magic link por email (Firebase Auth, gratis) — reemplaza el login sin
contraseña del prototipo. Nadie puede crear cuenta sin invitación: la
función `alCrearUsuario` (blocking function de Auth) solo deja pasar un
email si tiene una `invitaciones/{email}` pendiente (creada por un Dueño
desde /panel/usuarios) o si coincide con `config/bootstrap` (el primer
Dueño, configurado una sola vez con `npm run configurar-dueno`). **Requiere
habilitar Identity Platform** en la consola (Authentication > Configuración)
para que la blocking function dispare — es un toggle, sin costo aparte en
este volumen.

## Sync y conflictos

Offline/sync real ya lo da Firestore (ver arriba). Lo que Firestore NO
resuelve solo: dos ediciones offline sobre el mismo campo, en dos
dispositivos, hacen *last-write-wins* silencioso a nivel documento — viola
la regla del brief de "nunca perder un cambio en silencio". Cada escritura
incrementa un `version`; `functions/src/index.ts::detectarConflictos`
compara `before`/`after` en cada update: si `version` no avanzó exactamente
en 1 (dos ediciones partieron del mismo estado base), registra en
`conflictos/{id}` qué campo cambió, con ambos valores y autor/hora, para que
el Dueño elija (`src/panel/store.tsx::resolverConflicto`). No es una fusión
automática perfecta campo a campo — es la red de seguridad mínima que
cumple la promesa sin construir un motor de sync propio.

## Backup

`src/panel/backup.ts` — botón en `/panel/compartir` (solo Dueño): descarga
JSON completo o CSV de precios, 100% client-side. Complementa la carga
diaria por formulario, no la reemplaza.

## PWA

`public/manifest.json` + `public/sw.js` (cache en tiempo de uso, no precache
tipo Workbox — el proyecto usa Turbopack, no compatible con `next-pwa`).
Los datos offline los cubre la persistencia de Firestore; el service worker
cubre el shell estático (HTML/CSS/JS/imágenes) después de una primera visita
online.

## Pendiente / decisión de Alfredo

Las 3 preguntas abiertas del brief original (stock en unidades vs ml,
alcance exacto de permisos del Empleado, voseo vs tú) se resolvieron con los
defaults ya documentados ahí — ajustar si Alfredo pide otra cosa, no
bloquean nada de lo construido acá.
