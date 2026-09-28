import type { NextFunction, Request, Response } from "express";

import { entorno } from "../config/entorno";
import { ErrorHttp } from "../utilidades/ErrorHttp";

/** Responde 404 en formato JSON para rutas que no existen. */
export function rutaNoEncontrada(req: Request, res: Response) {
  res.status(404).json({
    ok: false,
    error: {
      codigo: "RUTA_NO_ENCONTRADA",
      mensaje: `No existe la ruta ${req.method} ${req.originalUrl}.`,
    },
  });
}

/** Códigos de error de Prisma que conviene traducir a respuestas claras. */
function traducirErrorDePrisma(error: unknown): ErrorHttp | null {
  if (typeof error !== "object" || error === null) return null;
  const codigo = (error as { code?: string }).code;

  switch (codigo) {
    case "P2002":
      return ErrorHttp.conflicto("Ya existe un registro con ese valor único.");
    case "P2025":
      return ErrorHttp.noEncontrado("El registro solicitado");
    case "P2003":
      return new ErrorHttp(
        409,
        "La operación viola una relación con otro registro.",
        "CONFLICTO_RELACION",
      );
    default:
      return null;
  }
}

/**
 * Manejo centralizado de errores. Express 5 envía aquí también los rechazos de
 * los controladores asíncronos, así que no hace falta envolverlos.
 */
export function manejadorDeErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const traducido =
    error instanceof ErrorHttp ? error : traducirErrorDePrisma(error);

  if (traducido) {
    res.status(traducido.estado).json({
      ok: false,
      error: {
        codigo: traducido.codigo,
        mensaje: traducido.message,
        ...(traducido.campos ? { campos: traducido.campos } : {}),
      },
    });
    return;
  }

  // Error no previsto: se registra completo y se responde sin filtrar detalles.
  console.error("[error no controlado]", error);

  res.status(500).json({
    ok: false,
    error: {
      codigo: "ERROR_INTERNO",
      mensaje: "Ocurrió un error inesperado. Intenta nuevamente.",
      ...(entorno.esProduccion
        ? {}
        : { detalle: error instanceof Error ? error.message : String(error) }),
    },
  });
}
