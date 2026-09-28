import type { Rol } from "../dominio/enumeraciones";

/**
 * Extiende el objeto Request de Express con los datos que agregan nuestros
 * middleware: el usuario autenticado y los parámetros de consulta validados.
 */
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        nombre: string;
        rol: Rol;
      };
      consulta?: unknown;
    }
  }
}

export {};
