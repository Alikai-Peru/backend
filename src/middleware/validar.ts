import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { ErrorHttp } from "../utilidades/ErrorHttp";

/** Convierte los problemas de Zod en un mapa campo -> mensaje. */
function aMapaDeCampos(problemas: { path: PropertyKey[]; message: string }[]) {
  const campos: Record<string, string> = {};
  for (const problema of problemas) {
    const clave = problema.path.map(String).join(".") || "general";
    campos[clave] ??= problema.message;
  }
  return campos;
}

/**
 * Valida el cuerpo de la petición y lo reemplaza por el valor ya convertido,
 * de modo que los controladores reciben datos tipados y confiables.
 */
export function validarCuerpo<T>(esquema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const resultado = esquema.safeParse(req.body);
    if (!resultado.success) {
      next(ErrorHttp.datosInvalidos(aMapaDeCampos(resultado.error.issues)));
      return;
    }
    req.body = resultado.data;
    next();
  };
}

/**
 * Valida los parámetros de consulta. El resultado se guarda en `req.consulta`
 * porque en Express 5 `req.query` es de solo lectura.
 */
export function validarConsulta<T>(esquema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const resultado = esquema.safeParse(req.query);
    if (!resultado.success) {
      next(ErrorHttp.datosInvalidos(aMapaDeCampos(resultado.error.issues)));
      return;
    }
    req.consulta = resultado.data;
    next();
  };
}
