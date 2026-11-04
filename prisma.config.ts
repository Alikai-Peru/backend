import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuración del CLI de Prisma (migraciones y generación del cliente).
 * Una cadena vacía no cuenta: si DIRECT_URL quedó en blanco, se usa DATABASE_URL.
 * Las migraciones necesitan la conexión de sesión (puerto 5432 en Supabase).
 */
function urlDeBase(): string {
  const directa = process.env.DIRECT_URL?.trim();
  const aplicacion = process.env.DATABASE_URL?.trim();
  return directa || aplicacion || "";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: urlDeBase(),
  },
});
