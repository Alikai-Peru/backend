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

function opcionesDeConexion() {
  const url = entorno.DATABASE_URL;
  const usaPooler =
    url.includes("pgbouncer=true") || url.includes(":6543/");
  const usaSupabase =
    url.includes("supabase.co") || url.includes("pooler.supabase.com");

  return {
    connectionString: url,
    max: usaPooler ? 3 : 10,
    ssl: usaSupabase ? { rejectUnauthorized: true } : undefined,
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
