import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import { requiereRol, requiereSesion } from "../middleware/autenticacion";
import { validarCuerpo } from "../middleware/validar";

export const rutasSitio = Router();

const bancoSchema = z.object({
  id: z.string().trim().min(1).max(40),
  banco: z.string().trim().min(2).max(120),
  corto: z.string().trim().min(2).max(40),
  tipo: z.string().trim().min(2).max(80),
  numero: z.string().trim().min(4).max(40),
  cci: z.string().trim().max(40).optional().default(""),
  titular: z.string().trim().min(2).max(120),
});

const personaSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  cargo: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(500).optional().default(""),
});

const hitoSchema = z.object({
  anio: z.string().trim().min(2).max(12),
  titulo: z.string().trim().min(2).max(160),
  descripcion: z.string().trim().max(500).optional().default(""),
});

const sitioSchema = z.object({
  email: z.string().trim().max(160).optional(),
  telefono: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(200).optional(),
  direccion: z.string().trim().max(240).optional(),
  horario: z.string().trim().max(120).optional(),
  facebook: z.string().trim().max(240).optional(),
  instagram: z.string().trim().max(240).optional(),
  linkedin: z.string().trim().max(240).optional(),
  youtube: z.string().trim().max(240).optional(),
  yapeNumero: z.string().trim().max(40).optional(),
  yapeTitular: z.string().trim().max(120).optional(),
  plinNumero: z.string().trim().max(40).optional(),
  plinTitular: z.string().trim().max(120).optional(),
  bancos: z.array(bancoSchema).max(8).optional(),
  equipo: z.array(personaSchema).max(12).optional(),
  hitos: z.array(hitoSchema).max(12).optional(),
});

const vacio = {
  email: "alikaiperu@gmail.com",
  telefono: "+51 992 575 510",
  whatsapp: "https://wa.link/ms4ybq",
  direccion: "",
  horario: "Atención 24/7",
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  yapeNumero: "",
  yapeTitular: "",
  plinNumero: "",
  plinTitular: "",
  bancos: [] as z.infer<typeof bancoSchema>[],
  equipo: [] as z.infer<typeof personaSchema>[],
  hitos: [] as z.infer<typeof hitoSchema>[],
};

function comoLista<T>(valor: unknown, esquema: z.ZodType<T[]>): T[] {
  const resultado = esquema.safeParse(valor);
  return resultado.success ? resultado.data : [];
}

function publicar(fila: {
  email: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  horario: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  yapeNumero: string;
  yapeTitular: string;
  plinNumero: string;
  plinTitular: string;
  bancos: unknown;
  equipo: unknown;
  hitos: unknown;
}) {
  return {
    contacto: {
      email: fila.email,
      telefono: fila.telefono,
      whatsapp: fila.whatsapp,
      direccion: fila.direccion,
      horario: fila.horario,
    },
    redes: {
      facebook: fila.facebook,
      instagram: fila.instagram,
      linkedin: fila.linkedin,
      youtube: fila.youtube,
    },
    pagos: {
      yape: { numero: fila.yapeNumero, titular: fila.yapeTitular },
      plin: { numero: fila.plinNumero, titular: fila.plinTitular },
      bancos: comoLista(fila.bancos, z.array(bancoSchema)),
    },
    equipo: comoLista(fila.equipo, z.array(personaSchema)),
    hitos: comoLista(fila.hitos, z.array(hitoSchema)),
  };
}

async function leer() {
  return prisma.configuracionSitio.findUnique({ where: { id: 1 } });
}

rutasSitio.get("/", async (_req, res) => {
  const fila = await leer();
  res.json({ ok: true, datos: fila ? publicar(fila) : publicar({ ...vacio, bancos: [], equipo: [], hitos: [] }) });
});

rutasSitio.put(
  "/",
  requiereSesion,
  requiereRol("ADMIN", "EDITOR"),
  validarCuerpo(sitioSchema),
  async (req, res) => {
    const datos = req.body as z.infer<typeof sitioSchema>;
    const fila = await prisma.configuracionSitio.upsert({
      where: { id: 1 },
      update: datos,
      create: { id: 1, ...vacio, ...datos },
    });
    res.json({ ok: true, datos: publicar(fila) });
  },
);
