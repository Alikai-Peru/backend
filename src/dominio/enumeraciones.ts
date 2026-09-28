import { z } from "zod";

import {
  EstadoDonacion,
  EstadoMensaje,
  EstadoPostulacion,
  EstadoProyecto,
  FrecuenciaDonacion,
  MetodoDonacion,
  MotivoContacto,
  Rol,
  TemaArea,
} from "../../generated/prisma/enums";

/**
 * Validadores derivados de las enumeraciones del esquema de Prisma, que a su
 * vez existen como tipos reales en Postgres.
 *
 * Al construir los esquemas de Zod a partir de ellas, agregar un valor nuevo
 * en `prisma/schema.prisma` lo habilita automáticamente en la API: no hay una
 * segunda lista que pueda quedar desincronizada.
 */

export const rolSchema = z.enum(Rol);
export type { Rol };

export const temaAreaSchema = z.enum(TemaArea);
export const estadoProyectoSchema = z.enum(EstadoProyecto);
export const motivoContactoSchema = z.enum(MotivoContacto);
export const estadoMensajeSchema = z.enum(EstadoMensaje);
export const estadoPostulacionSchema = z.enum(EstadoPostulacion);
export const frecuenciaDonacionSchema = z.enum(FrecuenciaDonacion);
export const metodoDonacionSchema = z.enum(MetodoDonacion);
export const estadoDonacionSchema = z.enum(EstadoDonacion);
