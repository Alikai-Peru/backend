import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../generated/prisma/client";
import { entorno } from "../src/config/entorno";
import { areasIniciales } from "./datos/areas-iniciales";

/**
 * Crea el administrador y el texto de partida de las seis áreas.
 * Si un área ya tiene lema, no se reemplaza: el panel es la fuente.
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

  for (const area of areasIniciales) {
    const existente = await prisma.area.findUnique({
      where: { slug: area.slug },
      select: { id: true, lema: true },
    });
    const rellenar = !existente || existente.lema.trim() === "";
    const { objetivos, programas, ...campos } = area;

    const guardada = await prisma.area.upsert({
      where: { slug: area.slug },
      update: rellenar
        ? campos
        : {
            nombre: campos.nombre,
            nombreCorto: campos.nombreCorto,
            icono: campos.icono,
            tema: campos.tema,
            orden: campos.orden,
          },
      create: campos,
    });

    if (rellenar) {
      await prisma.objetivoArea.deleteMany({ where: { areaId: guardada.id } });
      await prisma.programaArea.deleteMany({ where: { areaId: guardada.id } });
      await prisma.objetivoArea.createMany({
        data: objetivos.map((texto, orden) => ({ texto, orden, areaId: guardada.id })),
      });
      await prisma.programaArea.createMany({
        data: programas.map((programa, orden) => ({ ...programa, orden, areaId: guardada.id })),
      });
    }
  }

  console.log("Áreas listas. Si ya tenían texto, el panel lo conserva.");

  await prisma.configuracionSitio.upsert({
    where: { id: 1 },
    update: {
      email: "alikaiperu@gmail.com",
      telefono: "+51 992 575 510",
      whatsapp: "https://wa.link/ms4ybq",
      horario: "Atención 24/7",
    },
    create: {
      id: 1,
      email: "alikaiperu@gmail.com",
      telefono: "+51 992 575 510",
      whatsapp: "https://wa.link/ms4ybq",
      direccion: "",
      horario: "Atención 24/7",
    },
  });

  console.log("Contacto institucional listo. Redes, pagos, equipo e historia se editan en el panel.\n");
}

principal()
  .catch((error) => {
    console.error("\nFalló la carga del administrador:\n", error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
