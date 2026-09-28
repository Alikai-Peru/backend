import rateLimit from "express-rate-limit";

import { entorno } from "../config/entorno";

function respuestaExcedida(mensaje: string) {
  return {
    ok: false,
    error: { codigo: "DEMASIADAS_PETICIONES", mensaje },
  };
}

/**
 * Límite general de la API. En desarrollo se deja holgado para no estorbar
 * durante las pruebas.
 */
export const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: entorno.esProduccion ? 300 : 5000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: respuestaExcedida(
    "Has hecho demasiadas peticiones. Espera unos minutos.",
  ),
});

/**
 * Crea un límite independiente para un formulario público.
 *
 * Cada formulario lleva su propio contador: enviar un mensaje de contacto no
 * debe agotar la cuota de quien además quiere postular como voluntario o
 * registrar una donación.
 */
export function crearLimiteFormulario() {
  return rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: entorno.esProduccion ? 5 : 500,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: respuestaExcedida(
      "Recibimos varios envíos desde tu conexión. Intenta nuevamente más tarde o escríbenos por correo.",
    ),
  });
}

/** Límite para el inicio de sesión, contra intentos de fuerza bruta. */
export const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: entorno.esProduccion ? 10 : 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: respuestaExcedida(
    "Demasiados intentos de inicio de sesión. Espera 15 minutos.",
  ),
});
