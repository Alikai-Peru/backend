import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";
import { entorno } from "../config/entorno";

/**
 * Instancia única del cliente de Prisma.
 *
 * Prisma 7 exige un adaptador de driver: la URL ya no se declara en el esquema.
 * El mismo adaptador sirve para el Postgres de Docker y para Supabase.
 *
 * En desarrollo la instancia se guarda en el ámbito global para que el
 * reinicio en caliente de tsx no abra una conexión nueva en cada cambio.
 */
const global_ = globalThis as unknown as { prisma?: PrismaClient };

function urlConSsl(url: string) {
  const esSupabase =
    url.includes("supabase.co") || url.includes("pooler.supabase.com");
  if (!esSupabase) return url;
  // pg 8 pisa la opción ssl con lo que diga la URL. sslmode=require
  // vuelve a exigir el certificado, así que siempre se reemplaza.
  const sinModo = url
    .replace(/([?&])sslmode=[^&]*&?/g, "$1")
    .replace(/[?&]$/, "");
  const separador = sinModo.includes("?") ? "&" : "?";
  return `${sinModo}${separador}sslmode=no-verify`;
}

function opcionesDeConexion() {
  const url = urlConSsl(entorno.DATABASE_URL);
  const usaPooler =
    url.includes("pgbouncer=true") || url.includes(":6543/");
  const usaSupabase =
    url.includes("supabase.co") || url.includes("pooler.supabase.com");

  return {
    connectionString: url,
    max: usaPooler ? 3 : 10,
    ssl: usaSupabase ? { rejectUnauthorized: false } : undefined,
  };
}

function crearCliente() {
  const adapter = new PrismaPg(opcionesDeConexion());

  return new PrismaClient({
    adapter,
    log: entorno.esDesarrollo ? ["warn", "error"] : ["error"],
  });
}

export const prisma = global_.prisma ?? crearCliente();

if (entorno.esDesarrollo) {
  global_.prisma = prisma;
}
