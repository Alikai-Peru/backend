import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import { estadoProyectoSchema } from "../dominio/enumeraciones";
import { requiereRol, requiereSesion } from "../middleware/autenticacion";
import { validarConsulta, validarCuerpo } from "../middleware/validar";
import { consultaValidada } from "../utilidades/consulta";
import { ErrorHttp } from "../utilidades/ErrorHttp";
import { parametro } from "../utilidades/parametros";
import { slugUnicoParaProyecto } from "../utilidades/slug";
import {
  calcularSalto,
  construirMeta,
  consultaPaginadaSchema,
} from "../utilidades/paginacion";

export const rutasProyectos = Router();

const seleccionPublica = {
  slug: true,
  titulo: true,
  region: true,
  anio: true,
  estado: true,
  resumen: true,
  beneficiarios: true,
  avance: true,
  area: { select: { slug: true, nombre: true, tema: true } },
  aliados: { select: { nombre: true } },
} as const;

const listarSchema = consultaPaginadaSchema.extend({
  area: z.string().trim().min(1).max(80).optional(),
  estado: estadoProyectoSchema.optional(),
  region: z.string().trim().min(1).max(80).optional(),
});

/** Listado interno: incluye borradores. Debe ir antes de `/:slug`. */
rutasProyectos.get(
  "/gestion",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  async (_req, res) => {
    const proyectos = await prisma.proyecto.findMany({
      orderBy: [{ anio: "desc" }, { titulo: "asc" }],
      include: {
        area: { select: { slug: true, nombre: true, tema: true } },
        aliados: { select: { nombre: true } },
      },
    });

    res.json({
      ok: true,
      datos: proyectos.map((proyecto) => ({
        ...proyecto,
        aliados: proyecto.aliados.map((aliado) => aliado.nombre),
      })),
    });
  },
);

/** Listado público de proyectos, con los mismos filtros que usa el sitio. */
rutasProyectos.get("/", validarConsulta(listarSchema), async (req, res) => {
  const filtros = consultaValidada<z.infer<typeof listarSchema>>(req);

  const where = {
    publicado: true,
    ...(filtros.estado ? { estado: filtros.estado } : {}),
    ...(filtros.region ? { region: filtros.region } : {}),
    ...(filtros.area ? { area: { slug: filtros.area } } : {}),
  };

  const [proyectos, total] = await Promise.all([
    prisma.proyecto.findMany({
      where,
      orderBy: [{ anio: "desc" }, { titulo: "asc" }],
      skip: calcularSalto(filtros),
      take: filtros.porPagina,
      select: seleccionPublica,
    }),
    prisma.proyecto.count({ where }),
  ]);

  res.json({
    ok: true,
    datos: proyectos.map((proyecto) => ({
      ...proyecto,
      aliados: proyecto.aliados.map((aliado) => aliado.nombre),
    })),
    meta: construirMeta(filtros, total),
  });
});

rutasProyectos.get("/:slug", async (req, res) => {
  const proyecto = await prisma.proyecto.findUnique({
    where: { slug: parametro(req, "slug") },
    select: { ...seleccionPublica, publicado: true },
  });

  if (!proyecto || !proyecto.publicado) {
    throw ErrorHttp.noEncontrado("El proyecto");
  }

  res.json({
    ok: true,
    datos: {
      ...proyecto,
      aliados: proyecto.aliados.map((aliado) => aliado.nombre),
    },
  });
});

const proyectoSchema = z.object({
  titulo: z.string().trim().min(5).max(200),
  areaSlug: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80),
  anio: z.string().trim().regex(/^\d{4}$/, "El año debe tener cuatro dígitos."),
  estado: estadoProyectoSchema.default("EN_CURSO"),
  resumen: z.string().trim().min(10).max(1000),
  beneficiarios: z.string().trim().min(3).max(200),
  avance: z.number().int().min(0).max(100).default(0),
  publicado: z.boolean().default(true),
  aliados: z.array(z.string().trim().min(2).max(120)).default([]),
});

async function resolverAreaId(slug: string) {
  const area = await prisma.area.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!area) {
    throw ErrorHttp.datosInvalidos({ areaSlug: "El área indicada no existe." });
  }
  return area.id;
}

rutasProyectos.post(
  "/",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(proyectoSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof proyectoSchema>;
    const { areaSlug, aliados, ...campos } = datos;
    const slug = await slugUnicoParaProyecto(datos.titulo);

    const proyecto = await prisma.proyecto.create({
      data: {
        ...campos,
        slug,
        areaId: await resolverAreaId(areaSlug),
        aliados: { create: aliados.map((nombre) => ({ nombre })) },
      },
      select: seleccionPublica,
    });

    res.status(201).json({
      ok: true,
      datos: {
        ...proyecto,
        aliados: proyecto.aliados.map((aliado) => aliado.nombre),
      },
    });
  },
);

const actualizarProyectoSchema = proyectoSchema.partial();

rutasProyectos.patch(
  "/:slug",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(actualizarProyectoSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof actualizarProyectoSchema>;
    const { areaSlug, aliados, ...campos } = datos;

    const existente = await prisma.proyecto.findUnique({
      where: { slug: parametro(req, "slug") },
      select: { id: true },
    });
    if (!existente) throw ErrorHttp.noEncontrado("El proyecto");

    const slug = datos.titulo
      ? await slugUnicoParaProyecto(datos.titulo, existente.id)
      : undefined;

    const proyecto = await prisma.$transaction(async (tx) => {
      if (aliados) {
        await tx.aliadoProyecto.deleteMany({
          where: { proyectoId: existente.id },
        });
        await tx.aliadoProyecto.createMany({
          data: aliados.map((nombre) => ({
            nombre,
            proyectoId: existente.id,
          })),
        });
      }

      return tx.proyecto.update({
        where: { id: existente.id },
        data: {
          ...campos,
          ...(slug ? { slug } : {}),
          ...(areaSlug ? { areaId: await resolverAreaId(areaSlug) } : {}),
        },
        select: seleccionPublica,
      });
    });

    res.json({
      ok: true,
      datos: {
        ...proyecto,
        aliados: proyecto.aliados.map((aliado) => aliado.nombre),
      },
    });
  },
);

rutasProyectos.delete(
  "/:slug",
  requiereSesion,
  requiereRol("ADMIN"),
  async (req, res) => {
    const proyecto = await prisma.proyecto.findUnique({
      where: { slug: parametro(req, "slug") },
      select: { id: true },
    });
    if (!proyecto) throw ErrorHttp.noEncontrado("El proyecto");

    await prisma.proyecto.delete({ where: { id: proyecto.id } });
    res.json({ ok: true, datos: { eliminado: true } });
  },
);
