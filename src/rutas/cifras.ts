import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import { requiereRol, requiereSesion } from "../middleware/autenticacion";
import { validarCuerpo } from "../middleware/validar";
import { ErrorHttp } from "../utilidades/ErrorHttp";
import { parametro } from "../utilidades/parametros";

export const rutasCifras = Router();

/** Cifras de impacto que el sitio muestra en la portada y en «Nosotros». */
rutasCifras.get("/", async (_req, res) => {
  const cifras = await prisma.cifraImpacto.findMany({
    where: { activa: true },
    orderBy: { orden: "asc" },
    select: {
      clave: true,
      valor: true,
      sufijo: true,
      etiqueta: true,
      detalle: true,
      actualizadoEn: true,
    },
  });

  res.json({ ok: true, datos: cifras });
});

const cifraSchema = z.object({
  valor: z.number().int().min(0).optional(),
  sufijo: z.string().trim().max(5).nullable().optional(),
  etiqueta: z.string().trim().min(3).max(80).optional(),
  detalle: z.string().trim().min(5).max(300).optional(),
  orden: z.number().int().min(0).optional(),
  activa: z.boolean().optional(),
});

const crearCifraSchema = z.object({
  clave: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "La clave solo admite minúsculas, números y guiones."),
  valor: z.number().int().min(0),
  sufijo: z.string().trim().max(5).nullable().optional(),
  etiqueta: z.string().trim().min(3).max(80),
  detalle: z.string().trim().min(5).max(300),
  orden: z.number().int().min(0).optional(),
});

rutasCifras.post(
  "/",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(crearCifraSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof crearCifraSchema>;
    const cifra = await prisma.cifraImpacto.create({ data: datos });
    res.status(201).json({ ok: true, datos: cifra });
  },
);

rutasCifras.delete(
  "/:clave",
  requiereSesion,
  requiereRol("ADMIN"),
  async (req, res) => {
    const clave = parametro(req, "clave");
    const existente = await prisma.cifraImpacto.findUnique({ where: { clave } });
    if (!existente) throw ErrorHttp.noEncontrado("La cifra");
    await prisma.cifraImpacto.delete({ where: { clave } });
    res.json({ ok: true, datos: { eliminado: true } });
  },
);

rutasCifras.patch(
  "/:clave",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(cifraSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof cifraSchema>;

    if (Object.keys(datos).length === 0) {
      throw ErrorHttp.datosInvalidos({
        general: "Envía al menos un campo para actualizar.",
      });
    }

    const cifra = await prisma.cifraImpacto.update({
      where: { clave: parametro(req, "clave") },
      data: datos,
    });

    res.json({ ok: true, datos: cifra });
  },
);
