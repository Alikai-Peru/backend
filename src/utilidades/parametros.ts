import type { Request } from "express";

import { ErrorHttp } from "./ErrorHttp";

/**
 * Lee un parámetro de ruta garantizando que sea una cadena no vacía.
 *
 * En Express 5 los tipos de `req.params` admiten arreglos (por comodines como
 * `/*`), así que se comprueba explícitamente en lugar de forzar el tipo.
 */
export function parametro(req: Request, nombre: string): string {
  const valor = req.params[nombre];

  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw ErrorHttp.datosInvalidos({
      [nombre]: `El parámetro "${nombre}" es obligatorio y debe ser un texto.`,
    });
  }

  return valor;
}
