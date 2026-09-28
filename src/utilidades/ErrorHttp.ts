/**
 * Error con código de estado HTTP. Permite lanzar fallos desde cualquier capa
 * y que el middleware de errores los traduzca a una respuesta coherente.
 */
export class ErrorHttp extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string,
    public readonly codigo: string = "ERROR",
    public readonly campos?: Record<string, string>,
  ) {
    super(mensaje);
    this.name = "ErrorHttp";
  }

  static noEncontrado(recurso = "El recurso solicitado") {
    return new ErrorHttp(404, `${recurso} no existe.`, "NO_ENCONTRADO");
  }

  static noAutenticado(mensaje = "Necesitas iniciar sesión.") {
    return new ErrorHttp(401, mensaje, "NO_AUTENTICADO");
  }

  static sinPermiso(mensaje = "No tienes permisos para esta acción.") {
    return new ErrorHttp(403, mensaje, "SIN_PERMISO");
  }

  static datosInvalidos(
    campos: Record<string, string>,
    mensaje = "Revisa los datos enviados.",
  ) {
    return new ErrorHttp(422, mensaje, "DATOS_INVALIDOS", campos);
  }

  static conflicto(mensaje: string) {
    return new ErrorHttp(409, mensaje, "CONFLICTO");
  }
}
