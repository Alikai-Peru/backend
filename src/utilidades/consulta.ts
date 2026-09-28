import type { Request } from "express";

/**
 * Devuelve los parámetros de consulta ya validados por `validarConsulta`.
 * Centraliza la conversión de tipo para no repetirla en cada controlador.
 */
export function consultaValidada<T>(req: Request): T {
  return req.consulta as T;
}
