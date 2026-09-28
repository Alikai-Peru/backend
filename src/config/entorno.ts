import "dotenv/config";
import { z } from "zod";

/**
 * Valida las variables de entorno al arrancar. Si falta algo o es inválido, el
 * proceso termina con un mensaje claro en lugar de fallar más adelante.
 */
const esquema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria"),
  /** Conexión directa, solo necesaria para migrar con un pooler delante. */
  DIRECT_URL: z.string().optional(),
  CORS_ORIGENES: z.string().default("http://localhost:3000"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRACION: z.string().default("8h"),
  ADMIN_EMAIL: z.string().email().default("admin@alikaiperu.org"),
  ADMIN_PASSWORD: z.string().min(8).default("Alikai2026!"),
  ADMIN_NOMBRE: z.string().default("Administrador Alikai"),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  const detalles = resultado.error.issues
    .map((problema) => `  - ${problema.path.join(".")}: ${problema.message}`)
    .join("\n");

  console.error(
    `\nNo se puede iniciar: hay variables de entorno inválidas.\n${detalles}\n\n` +
      "Copia .env.example como .env y completa los valores.\n",
  );
  process.exit(1);
}

const valores = resultado.data;

export const entorno = {
  ...valores,
  esProduccion: valores.NODE_ENV === "production",
  esDesarrollo: valores.NODE_ENV === "development",
  origenesPermitidos: valores.CORS_ORIGENES.split(",")
    .map((origen) => origen.trim())
    .filter(Boolean),
};
