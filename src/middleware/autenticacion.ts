import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { entorno } from "../config/entorno";
import { rolSchema, type Rol } from "../dominio/enumeraciones";
import { ErrorHttp } from "../utilidades/ErrorHttp";

type ContenidoToken = {
  sub: string;
  email: string;
  nombre: string;
  rol: string;
};

export function firmarToken(usuario: {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}) {
  const contenido: ContenidoToken = {
    sub: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  };

  return jwt.sign(contenido, entorno.JWT_SECRET, {
    expiresIn: entorno.JWT_EXPIRACION as jwt.SignOptions["expiresIn"],
  });
}

/** Exige un token válido en el encabezado Authorization: Bearer <token>. */
export function requiereSesion(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const encabezado = req.headers.authorization;

  if (!encabezado?.startsWith("Bearer ")) {
    next(ErrorHttp.noAutenticado("Falta el token de acceso."));
    return;
  }

  const token = encabezado.slice("Bearer ".length).trim();

  try {
    const contenido = jwt.verify(token, entorno.JWT_SECRET) as ContenidoToken;
    const rol = rolSchema.safeParse(contenido.rol);

    if (!rol.success) {
      next(ErrorHttp.noAutenticado("El token tiene un rol no reconocido."));
      return;
    }

    req.usuario = {
      id: contenido.sub,
      email: contenido.email,
      nombre: contenido.nombre,
      rol: rol.data,
    };
    next();
  } catch (error) {
    const expirado = error instanceof jwt.TokenExpiredError;
    next(
      ErrorHttp.noAutenticado(
        expirado
          ? "La sesión expiró. Inicia sesión nuevamente."
          : "El token de acceso no es válido.",
      ),
    );
  }
}

/** Restringe una ruta a determinados roles. Debe usarse tras requiereSesion. */
export function requiereRol(...rolesPermitidos: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario) {
      next(ErrorHttp.noAutenticado());
      return;
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      next(ErrorHttp.sinPermiso());
      return;
    }
    next();
  };
}
