import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import { temaAreaSchema } from "../dominio/enumeraciones";
import { requiereRol, requiereSesion } from "../middleware/autenticacion";
import { validarCuerpo } from "../middleware/validar";
import { ErrorHttp } from "../utilidades/ErrorHttp";
import { parametro } from "../utilidades/parametros";

export const rutasAreas = Router();

const incluirDetalle = {
  objetivos: { orderBy: { orden: "asc" }, select: { texto: true, orden: true } },
  programas: {
    orderBy: { orden: "asc" },
    select: { titulo: true, descripcion: true, orden: true },
  },
} as const;

/** Listado público de áreas con sus objetivos y programas. */
rutasAreas.get("/", async (_req, res) => {
  const areas = await prisma.area.findMany({
    where: { activa: true },
    orderBy: { orden: "asc" },
    include: incluirDetalle,
  });

  res.json({ ok: true, datos: areas });
});

rutasAreas.get("/:slug", async (req, res) => {
  const area = await prisma.area.findUnique({
    where: { slug: parametro(req, "slug") },
    include: {
      ...incluirDetalle,
      proyectos: {
        where: { publicado: true },
        orderBy: { anio: "desc" },
        select: {
          slug: true,
          titulo: true,
          region: true,
          anio: true,
          estado: true,
          resumen: true,
          beneficiarios: true,
          avance: true,
        },
      },
    },
  });

  if (!area || !area.activa) throw ErrorHttp.noEncontrado("El área");

  res.json({ ok: true, datos: area });
});

const areaSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo admite minúsculas, números y guiones.",
    ),
  nombre: z.string().trim().min(2).max(120),
  nombreCorto: z.string().trim().min(2).max(60),
  lema: z.string().trim().min(3).max(160),
  resumen: z.string().trim().min(10).max(500),
  descripcion: z.string().trim().min(20).max(8000),
  icono: z.string().trim().min(2).max(60),
  tema: temaAreaSchema.default("marino"),
  indicadorValor: z.string().trim().min(1).max(20),
  indicadorEtiqueta: z.string().trim().min(2).max(80),
  orden: z.number().int().min(0).default(0),
  activa: z.boolean().default(true),
  objetivos: z.array(z.string().trim().min(5).max(400)).default([]),
  programas: z
    .array(
      z.object({
        titulo: z.string().trim().min(2).max(120),
        descripcion: z.string().trim().min(10).max(1000),
      }),
    )
    .default([]),
});

rutasAreas.post(
  "/",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(areaSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof areaSchema>;
    const { objetivos, programas, ...campos } = datos;

    const area = await prisma.area.create({
      data: {
        ...campos,
        objetivos: {
          create: objetivos.map((texto, indice) => ({ texto, orden: indice })),
        },
        programas: {
          create: programas.map((programa, indice) => ({
            ...programa,
            orden: indice,
          })),
        },
      },
      include: incluirDetalle,
    });

    res.status(201).json({ ok: true, datos: area });
  },
);

const actualizarAreaSchema = areaSchema.partial();

rutasAreas.patch(
  "/:slug",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(actualizarAreaSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof actualizarAreaSchema>;
    const { objetivos, programas, ...campos } = datos;

    const existente = await prisma.area.findUnique({
      where: { slug: parametro(req, "slug") },
      select: { id: true },
    });
    if (!existente) throw ErrorHttp.noEncontrado("El área");

    // Las listas se reemplazan por completo: es más predecible que intentar
    // conciliar elemento por elemento desde el panel de administración.
    const area = await prisma.$transaction(async (tx) => {
      if (objetivos) {
        await tx.objetivoArea.deleteMany({ where: { areaId: existente.id } });
        await tx.objetivoArea.createMany({
          data: objetivos.map((texto, indice) => ({
            texto,
            orden: indice,
            areaId: existente.id,
          })),
        });
      }
      if (programas) {
        await tx.programaArea.deleteMany({ where: { areaId: existente.id } });
        await tx.programaArea.createMany({
          data: programas.map((programa, indice) => ({
            ...programa,
            orden: indice,
            areaId: existente.id,
          })),
        });
      }

      return tx.area.update({
        where: { id: existente.id },
        data: campos,
        include: incluirDetalle,
      });
    });

    res.json({ ok: true, datos: area });
  },
);

rutasAreas.delete(
  "/:slug",
  requiereSesion,
  requiereRol("ADMIN"),
  async (req, res) => {
    const area = await prisma.area.findUnique({
      where: { slug: parametro(req, "slug") },
      select: { id: true },
    });

    if (!area) throw ErrorHttp.noEncontrado("El área");

    const proyectosAsociados = await prisma.proyecto.count({
      where: { areaId: area.id },
    });

    if (proyectosAsociados > 0) {
      throw ErrorHttp.conflicto(
        "No se puede eliminar un área que tiene proyectos asociados. Desactívala en lugar de borrarla.",
      );
    }

    await prisma.area.delete({ where: { id: area.id } });
    res.json({ ok: true, datos: { eliminado: true } });
  },
);
