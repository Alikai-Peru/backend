import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { entorno } from "../src/config/entorno";

/**
 * Borra los registros que generan las pruebas (mensajes, postulaciones y
 * donaciones) y deja intacto el contenido institucional: áreas, proyectos,
 * cifras y usuarios.
 *
 * Pensado para el entorno local, después de probar los formularios.
 */

if (entorno.esProduccion) {
  console.error("Este script no debe ejecutarse en producción.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: entorno.DATABASE_URL }),
});

async function principal() {
  const [mensajes, postulaciones, donaciones] = await Promise.all([
    prisma.mensajeContacto.deleteMany(),
    prisma.postulacionVoluntario.deleteMany(),
    prisma.donacion.deleteMany(),
  ]);

  console.log("\nRegistros eliminados:");
  console.log(`  mensajes de contacto:  ${mensajes.count}`);
  console.log(`  postulaciones:         ${postulaciones.count}`);
  console.log(`  donaciones:            ${donaciones.count}`);
  console.log("\nEl contenido (áreas, proyectos, cifras) se mantiene.\n");
}

principal()
  .catch((error) => {
    console.error("\nFalló la limpieza:\n", error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
