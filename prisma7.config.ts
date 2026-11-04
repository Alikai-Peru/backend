import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 carga este archivo en el contenedor. La configuración va aquí
 * mismo: un reexport dejaba datasource.url vacío y migrate deploy fallaba.
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
