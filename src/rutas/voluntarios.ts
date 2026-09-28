import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import { estadoPostulacionSchema } from "../dominio/enumeraciones";
import { requiereRol, requiereSesion } from "../middleware/autenticacion";
import { validarConsulta, validarCuerpo } from "../middleware/validar";
import { consultaValidada } from "../utilidades/consulta";
import { ErrorHttp } from "../utilidades/ErrorHttp";
import { parametro } from "../utilidades/parametros";
import {
  calcularSalto,
  construirMeta,
  consultaPaginadaSchema,
} from "../utilidades/paginacion";

export const rutasVoluntarios = Router();

const postularSchema = z.object({
  nombres: z.string().trim().min(2, "Escribe tus nombres.").max(80),
  apellidos: z.string().trim().min(2, "Escribe tus apellidos.").max(80),
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
  telefono: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{6,20}$/, "Ingresa un teléfono válido."),
  profesion: z
    .string()
    .trim()
    .min(3, "Indica tu profesión u ocupación.")
    .max(120),
  disponibilidad: z
    .string()
    .trim()
    .min(5, "Cuéntanos qué días y horarios tienes disponibles.")
    .max(500),
  experiencia: z.string().trim().max(2000).optional().or(z.literal("")),
  motivacion: z
    .string()
    .trim()
    .min(20, "Cuéntanos por qué quieres ser voluntario: al menos 20 caracteres.")
    .max(2000),
  areaInteresSlug: z.string().trim().min(1).max(80).optional(),
});

/** Postulación pública al programa de voluntariado. */
rutasVoluntarios.post("/", validarCuerpo(postularSchema), async (req, res) => {
  const datos = req.body as z.infer<typeof postularSchema>;

  let areaInteresId: string | null = null;
  if (datos.areaInteresSlug) {
    const area = await prisma.area.findUnique({
      where: { slug: datos.areaInteresSlug },
      select: { id: true },
    });
    if (!area) {
      throw ErrorHttp.datosInvalidos({
        areaInteresSlug: "El área indicada no existe.",
      });
    }
    areaInteresId = area.id;
  }

  const postulacion = await prisma.postulacionVoluntario.create({
    data: {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      email: datos.email.toLowerCase(),
      telefono: datos.telefono,
      profesion: datos.profesion,
      disponibilidad: datos.disponibilidad,
      experiencia: datos.experiencia || null,
      motivacion: datos.motivacion,
      areaInteresId,
    },
    select: { id: true, creadoEn: true },
  });

  res.status(201).json({
    ok: true,
    datos: {
      id: postulacion.id,
      recibidoEn: postulacion.creadoEn,
      mensaje:
        "Recibimos tu postulación. El equipo de programas te contactará para la inducción.",
    },
  });
});

const listarSchema = consultaPaginadaSchema.extend({
  estado: estadoPostulacionSchema.optional(),
  area: z.string().trim().min(1).max(80).optional(),
});

rutasVoluntarios.get(
  "/",
  requiereSesion,
  validarConsulta(listarSchema),
  async (req, res) => {
    const filtros = consultaValidada<z.infer<typeof listarSchema>>(req);

    const where = {
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.area ? { areaInteres: { slug: filtros.area } } : {}),
    };

    const [postulaciones, total] = await Promise.all([
      prisma.postulacionVoluntario.findMany({
        where,
        orderBy: { creadoEn: "desc" },
        skip: calcularSalto(filtros),
        take: filtros.porPagina,
        include: {
          areaInteres: { select: { slug: true, nombre: true } },
        },
      }),
      prisma.postulacionVoluntario.count({ where }),
    ]);

    res.json({
      ok: true,
      datos: postulaciones,
      meta: construirMeta(filtros, total),
    });
  },
);

const actualizarSchema = z
  .object({
    estado: estadoPostulacionSchema.optional(),
    notaInterna: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Envía al menos un campo para actualizar.",
  });

rutasVoluntarios.patch(
  "/:id",
  requiereSesion,
  validarCuerpo(actualizarSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof actualizarSchema>;

    const postulacion = await prisma.postulacionVoluntario.update({
      where: { id: parametro(req, "id") },
      data: datos,
      include: { areaInteres: { select: { slug: true, nombre: true } } },
    });

    res.json({ ok: true, datos: postulacion });
  },
);

rutasVoluntarios.delete(
  "/:id",
  requiereSesion,
  requiereRol("ADMIN"),
  async (req, res) => {
    await prisma.postulacionVoluntario.delete({ where: { id: parametro(req, "id") } });
    res.json({ ok: true, datos: { eliminado: true } });
  },
);
