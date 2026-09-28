import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import {
  estadoDonacionSchema,
  frecuenciaDonacionSchema,
  metodoDonacionSchema,
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

export const rutasDonaciones = Router();

/** En la base de datos el monto se guarda en céntimos; la API usa soles. */
function aSoles(centimos: number) {
  return Number((centimos / 100).toFixed(2));
}

function conMontoEnSoles<T extends { montoCentimos: number }>(donacion: T) {
  const { montoCentimos, ...resto } = donacion;
  return { ...resto, monto: aSoles(montoCentimos) };
}

const registrarSchema = z.object({
  monto: z
    .number({ message: "Indica el monto de la donación." })
    .positive("El monto debe ser mayor a cero.")
    .max(1_000_000, "Para montos mayores, contáctanos directamente."),
  frecuencia: frecuenciaDonacionSchema.default("UNICA"),
  metodo: metodoDonacionSchema.default("TRANSFERENCIA"),
  nombre: z.string().trim().min(3).max(120).optional(),
  email: z.string().trim().email("Ingresa un correo válido.").optional(),
  telefono: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]{6,20}$/, "Ingresa un teléfono válido.")
    .optional(),
  anonima: z.boolean().default(false),
  mensaje: z.string().trim().max(1000).optional(),
  referencia: z.string().trim().max(120).optional(),
  areaSlug: z.string().trim().max(80).optional(),
  proyectoSlug: z.string().trim().max(120).optional(),
});

/**
 * Registra la intención de donar. Queda en estado PENDIENTE hasta que el equipo
 * confirma el abono, o hasta que lo confirme la pasarela de pago cuando se
 * integre.
 */
rutasDonaciones.post("/", validarCuerpo(registrarSchema), async (req, res) => {
  const datos = req.body as z.infer<typeof registrarSchema>;

  if (!datos.anonima && !datos.email) {
    throw ErrorHttp.datosInvalidos({
      email: "Indica un correo para enviarte el comprobante, o marca la donación como anónima.",
    });
  }

  let areaId: string | null = null;
  if (datos.areaSlug) {
    const area = await prisma.area.findUnique({
      where: { slug: datos.areaSlug },
      select: { id: true },
    });
    if (!area) {
      throw ErrorHttp.datosInvalidos({ areaSlug: "El área indicada no existe." });
    }
    areaId = area.id;
  }

  let proyectoId: string | null = null;
  if (datos.proyectoSlug) {
    const proyecto = await prisma.proyecto.findUnique({
      where: { slug: datos.proyectoSlug },
      select: { id: true },
    });
    if (!proyecto) {
      throw ErrorHttp.datosInvalidos({
        proyectoSlug: "El proyecto indicado no existe.",
      });
    }
    proyectoId = proyecto.id;
  }

  const donacion = await prisma.donacion.create({
    data: {
      montoCentimos: Math.round(datos.monto * 100),
      frecuencia: datos.frecuencia,
      metodo: datos.metodo,
      nombre: datos.anonima ? null : (datos.nombre ?? null),
      email: datos.anonima ? null : (datos.email ?? null),
      telefono: datos.anonima ? null : (datos.telefono ?? null),
      anonima: datos.anonima,
      mensaje: datos.mensaje ?? null,
      referencia: datos.referencia ?? null,
      areaId,
      proyectoId,
    },
  });

  /**
   * TODO (Alikai): al integrar la pasarela de pago (Culqi, Izipay o Mercado
   * Pago), crear aquí la orden y devolver la URL de pago. El webhook de la
   * pasarela debe actualizar el estado a CONFIRMADA.
   */

  res.status(201).json({
    ok: true,
    datos: {
      ...conMontoEnSoles(donacion),
      instrucciones:
        "Registramos tu donación. Te contactaremos para coordinar el pago y enviarte el comprobante.",
    },
  });
});

const listarSchema = consultaPaginadaSchema.extend({
  estado: estadoDonacionSchema.optional(),
  frecuencia: frecuenciaDonacionSchema.optional(),
});

rutasDonaciones.get(
  "/",
  requiereSesion,
  validarConsulta(listarSchema),
  async (req, res) => {
    const filtros = consultaValidada<z.infer<typeof listarSchema>>(req);

    const where = {
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.frecuencia ? { frecuencia: filtros.frecuencia } : {}),
    };

    const [donaciones, total] = await Promise.all([
      prisma.donacion.findMany({
        where,
        orderBy: { creadoEn: "desc" },
        skip: calcularSalto(filtros),
        take: filtros.porPagina,
        include: {
          area: { select: { slug: true, nombre: true } },
          proyecto: { select: { slug: true, titulo: true } },
        },
      }),
      prisma.donacion.count({ where }),
    ]);

    res.json({
      ok: true,
      datos: donaciones.map(conMontoEnSoles),
      meta: construirMeta(filtros, total),
    });
  },
);

/** Totales para el panel: recaudado, pendiente y número de donantes. */
rutasDonaciones.get("/resumen", requiereSesion, async (_req, res) => {
  const [confirmadas, pendientes, mensuales] = await Promise.all([
    prisma.donacion.aggregate({
      where: { estado: "CONFIRMADA" },
      _sum: { montoCentimos: true },
      _count: true,
    }),
    prisma.donacion.aggregate({
      where: { estado: "PENDIENTE" },
      _sum: { montoCentimos: true },
      _count: true,
    }),
    prisma.donacion.count({
      where: { frecuencia: "MENSUAL", estado: "CONFIRMADA" },
    }),
  ]);

  res.json({
    ok: true,
    datos: {
      confirmado: {
        total: aSoles(confirmadas._sum.montoCentimos ?? 0),
        cantidad: confirmadas._count,
      },
      pendiente: {
        total: aSoles(pendientes._sum.montoCentimos ?? 0),
        cantidad: pendientes._count,
      },
      donantesMensuales: mensuales,
      moneda: "PEN",
    },
  });
});

const actualizarSchema = z
  .object({
    estado: estadoDonacionSchema.optional(),
    referencia: z.string().trim().max(120).nullable().optional(),
  })
  .refine((datos) => Object.keys(datos).length > 0, {
    message: "Envía al menos un campo para actualizar.",
  });

rutasDonaciones.patch(
  "/:id",
  requiereSesion,
  validarCuerpo(actualizarSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof actualizarSchema>;

    const donacion = await prisma.donacion.update({
      where: { id: parametro(req, "id") },
      data: {
        ...datos,
        ...(datos.estado === "CONFIRMADA" ? { confirmadaEn: new Date() } : {}),
      },
    });

    res.json({ ok: true, datos: conMontoEnSoles(donacion) });
  },
);

rutasDonaciones.delete(
  "/:id",
  requiereSesion,
  requiereRol("ADMIN"),
  async (req, res) => {
    await prisma.donacion.delete({ where: { id: parametro(req, "id") } });
    res.json({ ok: true, datos: { eliminado: true } });
  },
);
