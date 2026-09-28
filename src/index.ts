import { crearApp } from "./app";
import { entorno } from "./config/entorno";
import { prisma } from "./db/prisma";

async function iniciar() {
  // Falla temprano y con un mensaje claro si la base de datos no responde.
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error(
      "\nNo se pudo conectar a la base de datos.\n" +
        "Verifica DATABASE_URL en .env y ejecuta: npm run db:migrar\n",
      error,
    );
    process.exit(1);
  }

  const app = crearApp();
  const servidor = app.listen(entorno.PORT, "0.0.0.0", () => {
    console.log(
      `\n  API de Alikai Perú\n` +
        `  Entorno:  ${entorno.NODE_ENV}\n` +
        `  Puerto:   ${entorno.PORT}\n` +
        `  Salud:    /api/salud\n`,
    );
  });

  // Cierre ordenado: deja de aceptar conexiones y suelta la base de datos.
  const apagar = async (senal: string) => {
    console.log(`\nRecibido ${senal}, cerrando el servidor...`);
    servidor.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void apagar("SIGINT"));
  process.on("SIGTERM", () => void apagar("SIGTERM"));
}

void iniciar();
