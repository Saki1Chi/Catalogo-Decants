# Catálogo de decants (promocional_perfumes)

Sitio de catálogo de decants de perfume (Next.js, export estático) + panel
de gestión para Alfredo/su empleado. Contexto de negocio y decisiones de
producto en `design/panel-admin/` (empezar por `LEEME.md` y
`05-backend.md`).

## Desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) para el catálogo
público, `/panel` para el panel de gestión.

## Backend (Firebase) — puesta en marcha

El panel (`/panel/**`) corre sobre Firestore/Storage/Auth — ver el porqué y
el modelo completo en `design/panel-admin/05-backend.md`. Para que funcione
de verdad (no solo compile) hace falta, en orden:

1. **Crear el proyecto** en [console.firebase.google.com](https://console.firebase.google.com/),
   con Firestore, Storage y Authentication (método "Email link") habilitados.
   Habilitar también **Identity Platform** (Authentication > Configuración) —
   lo necesita la función de invitación de usuarios.
2. Copiar `.env.local.example` a `.env.local` y completar con las claves del
   proyecto (Configuración del proyecto > Tus apps > SDK de Firebase).
3. Descargar una clave de cuenta de servicio (Configuración del proyecto >
   Cuentas de servicio > Generar nueva clave privada), guardarla **fuera**
   del repo, y apuntar `FIREBASE_SERVICE_ACCOUNT_PATH` a esa ruta en
   `.env.local`.
4. `firebase login` (una vez, por dispositivo) y editar `.firebaserc` con el
   Project ID real.
5. Deployar reglas y funciones:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   cd functions && npm install && cd ..
   firebase deploy --only functions
   ```
6. Configurar quién es el primer Dueño (antes de que Alfredo entre por
   primera vez):
   ```bash
   npm run configurar-dueno -- --email="alfredo@..." --nombre="Alfredo Márquez"
   ```
7. Migrar los 132 perfumes del inventario:
   ```bash
   npm run migrar-inventario -- --dry-run   # revisar avisos primero
   npm run migrar-inventario
   ```
8. `npm run build` y deployar `out/` al hosting elegido (Firebase Hosting,
   Vercel, Netlify — cualquiera sirve, sigue siendo un sitio estático).

## Estructura

- `src/data/perfumes.ts`, `public/perfumes/` — snapshot con el que se hizo
  el primer export estático (ya no se vuelve a leer una vez migrado a
  Firestore; ver punto 7 arriba).
- `src/app/panel/**`, `src/components/panel/**` — UI del panel.
- `src/panel/**` — lógica/estado del panel (`store.tsx` es el punto central).
- `src/lib/firebase.ts` — init del SDK cliente.
- `functions/` — Cloud Functions (auth, agregados de stock, resize de fotos,
  detección de conflictos).
- `scripts/` — migración inicial y setup, corren local con `tsx`.
- `firestore.rules`, `storage.rules` — permisos reales por rol.
