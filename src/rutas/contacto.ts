import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import {
  estadoMensajeSchema,
  motivoContactoSchema,
} from "../dominio/enumeraciones";
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

export const rutasContacto = Router();

const crearMensajeSchema = z.object({
  nombre: z.string().trim().min(3, "Escribe tu nombre completo.").max(120),
  email: z.string().trim().email("Ingresa un correo electrónico válido."),
  telefono: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{6,20}$/, "Ingresa un teléfono válido.")
    .optional()
    .or(z.literal("")),
  motivo: motivoContactoSchema,
  mensaje: z
    .string()
    .trim()
    .min(20, "Cuéntanos un poco más: al menos 20 caracteres.")
    .max(4000),
  aceptaPrivacidad: z.literal(true, {
    message: "Necesitamos tu autorización para responderte.",
  }),
});

/** Envío del formulario público de contacto. */
rutasContacto.post("/", validarCuerpo(crearMensajeSchema), async (req, res) => {
  const datos = req.body as z.infer<typeof crearMensajeSchema>;

  const mensaje = await prisma.mensajeContacto.create({
    data: {
      nombre: datos.nombre,
      email: datos.email.toLowerCase(),
      telefono: datos.telefono || null,
      motivo: datos.motivo,
      mensaje: datos.mensaje,
      aceptaPrivacidad: true,
      ipOrigen: req.ip ?? null,
    },
    select: { id: true, creadoEn: true },
  });

  /**
   * TODO (Alikai): notificar al equipo por correo cuando llega un mensaje.
   * El registro ya queda guardado en la base de datos, así que ningún mensaje
   * se pierde mientras se integra el envío de correos.
   */

  res.status(201).json({
    ok: true,
    datos: {
      id: mensaje.id,
      recibidoEn: mensaje.creadoEn,
      mensaje:
        "Gracias por escribirnos. Te responderemos en un plazo de 48 horas hábiles.",
    },
  });
});

const listarSchema = consultaPaginadaSchema.extend({
  estado: estadoMensajeSchema.optional(),
  motivo: motivoContactoSchema.optional(),
  buscar: z.string().trim().min(1).max(120).optional(),
});

/** Bandeja de mensajes para el panel de administración. */
rutasContacto.get(
  "/",
  requiereSesion,
  validarConsulta(listarSchema),
  async (req, res) => {
    const filtros = consultaValidada<z.infer<typeof listarSchema>>(req);

    const where = {
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.motivo ? { motivo: filtros.motivo } : {}),
      // `insensitive` es necesario en Postgres: a diferencia de SQLite, aquí
      // `contains` distingue mayúsculas de minúsculas.
      ...(filtros.buscar
        ? {
            OR: [
              { nombre: { contains: filtros.buscar, mode: "insensitive" as const } },
              { email: { contains: filtros.buscar, mode: "insensitive" as const } },
              { mensaje: { contains: filtros.buscar, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [mensajes, total, sinLeer] = await Promise.all([
      prisma.mensajeContacto.findMany({
        where,
        orderBy: { creadoEn: "desc" },
        skip: calcularSalto(filtros),
        take: filtros.porPagina,
        omit: { ipOrigen: true },
        include: {
          atendidoPor: { select: { id: true, nombre: true } },
        },
      }),
      prisma.mensajeContacto.count({ where }),
      prisma.mensajeContacto.count({ where: { estado: "NUEVO" } }),
    ]);

    res.json({
      ok: true,
      datos: mensajes,
      meta: { ...construirMeta(filtros, total), sinLeer },
    });
  },
);

rutasContacto.get("/:id", requiereSesion, async (req, res) => {
  const mensaje = await prisma.mensajeContacto.findUnique({
    where: { id: parametro(req, "id") },
    omit: { ipOrigen: true },
    include: { atendidoPor: { select: { id: true, nombre: true } } },
  });

  if (!mensaje) throw ErrorHttp.noEncontrado("El mensaje");

  res.json({ ok: true, datos: mensaje });
});

const actualizarSchema = z
  .object({
    estado: estadoMensajeSchema.optional(),
    notaInterna: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Envía al menos un campo para actualizar.",
  });

/** Cambia el estado o agrega una nota interna al mensaje. */
rutasContacto.patch(
  "/:id",
  requiereSesion,
  validarCuerpo(actualizarSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof actualizarSchema>;

    const mensaje = await prisma.mensajeContacto.update({
      where: { id: parametro(req, "id") },
      data: {
        ...(datos.estado ? { estado: datos.estado } : {}),
        ...(datos.notaInterna !== undefined
          ? { notaInterna: datos.notaInterna }
          : {}),
        ...(datos.estado === "RESPONDIDO" ? { respondidoEn: new Date() } : {}),
        atendidoPorId: req.usuario!.id,
      },
      omit: { ipOrigen: true },
    });

    res.json({ ok: true, datos: mensaje });
  },
);

rutasContacto.delete(
  "/:id",
  requiereSesion,
  requiereRol("ADMIN"),
  async (req, res) => {
    await prisma.mensajeContacto.delete({ where: { id: parametro(req, "id") } });
    res.json({ ok: true, datos: { eliminado: true } });
  },
);
