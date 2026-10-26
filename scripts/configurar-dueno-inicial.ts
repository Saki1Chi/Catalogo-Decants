/**
 * Paso único de setup (Fase 0/3): registra quién es el primer Dueño — la
 * única persona que puede entrar al panel sin haber sido invitada por otro
 * Dueño (ver functions/src/index.ts::alCrearUsuario). Correr una sola vez
 * después de crear el proyecto de Firebase, antes de que Alfredo entre por
 * primera vez.
 *
 * Uso:
 *   npm run configurar-dueno -- --email=alfredo@ejemplo.com --nombre="Alfredo Márquez"
 */
import "dotenv/config";
import * as fs from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const email = args.find((a) => a.startsWith("--email="))?.split("=")[1];
const nombre = args.find((a) => a.startsWith("--nombre="))?.split("=")[1];

if (!email || !nombre) {
  console.error('Uso: npm run configurar-dueno -- --email="..." --nombre="..."');
  process.exit(1);
}

const rutaCuenta = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!rutaCuenta) {
  console.error("Falta FIREBASE_SERVICE_ACCOUNT_PATH en .env.local — ver .env.local.example.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(rutaCuenta, "utf-8"));
initializeApp({ credential: cert(serviceAccount) });

getFirestore()
  .collection("config")
  .doc("bootstrap")
  .set({ emailDueñoInicial: email.toLowerCase(), nombreDueñoInicial: nombre })
  .then(() => {
    console.log(`Listo. ${email} ya puede entrar al panel como Dueño (recibe el link en /panel/login).`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
