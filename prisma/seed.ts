import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../generated/prisma/client";
import { entorno } from "../src/config/entorno";

/**
 * Crea solo el usuario administrador.
 * No inserta áreas, proyectos, cifras ni ningún texto de ejemplo.
 * El contenido público se carga después, desde el panel, con datos reales.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: entorno.DATABASE_URL }),
});

async function principal() {
  const passwordHash = await bcrypt.hash(entorno.ADMIN_PASSWORD, 10);
  const email = entorno.ADMIN_EMAIL.toLowerCase();

  await prisma.usuario.upsert({
    where: { email },
    update: { nombre: entorno.ADMIN_NOMBRE, rol: "ADMIN", activo: true },
    create: {
      email,
      nombre: entorno.ADMIN_NOMBRE,
      passwordHash,
      rol: "ADMIN",
    },
  });

  console.log(`\nUsuario administrador listo: ${email}`);

  const areas = [
    { slug: "tecnologia", nombre: "Tecnología", nombreCorto: "Tecnología", icono: "Wifi", tema: "marino" as const, orden: 0 },
    { slug: "salud", nombre: "Salud", nombreCorto: "Salud", icono: "HeartPulse", tema: "selva" as const, orden: 1 },
    { slug: "educacion", nombre: "Educación", nombreCorto: "Educación", icono: "BookOpen", tema: "marino" as const, orden: 2 },
    { slug: "agricultura-sostenible", nombre: "Agricultura Sostenible", nombreCorto: "Agricultura", icono: "Sprout", tema: "selva" as const, orden: 3 },
    { slug: "ayuda-social", nombre: "Ayuda Social", nombreCorto: "Ayuda Social", icono: "HandHeart", tema: "marino" as const, orden: 4 },
    { slug: "cultura", nombre: "Cultura", nombreCorto: "Cultura", icono: "Theater", tema: "dorado" as const, orden: 5 },
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { slug: area.slug },
      update: {
        nombre: area.nombre,
        nombreCorto: area.nombreCorto,
        icono: area.icono,
        tema: area.tema,
        orden: area.orden,
      },
      create: {
        ...area,
        lema: "",
        resumen: "",
        descripcion: "",
        indicadorValor: "",
        indicadorEtiqueta: "",
      },
    });
  }

  console.log("Áreas vacías listas. No se cargaron proyectos, cifras ni textos de ejemplo.\n");
}

principal()
  .catch((error) => {
    console.error("\nFalló la carga del administrador:\n", error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
