import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Configuración del CLI de Prisma (migraciones y generación del cliente).
 *
 * Se prefiere DIRECT_URL cuando existe porque las migraciones necesitan una
 * conexión directa a Postgres. En Supabase el pooler en modo transaction
 * (puerto 6543) no admite esas sentencias.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
