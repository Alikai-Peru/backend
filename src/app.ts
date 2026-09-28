import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { entorno } from "./config/entorno";
import { manejadorDeErrores, rutaNoEncontrada } from "./middleware/errores";
import { limiteGeneral } from "./middleware/limites";
import { rutas } from "./rutas";

export function crearApp() {
  const app = express();

  // Necesario para que req.ip refleje la IP real detrás de un proxy o balanceador.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: entorno.origenesPermitidos,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  if (!entorno.esProduccion) {
    app.use(morgan("dev"));
  }

  app.use(limiteGeneral);
  app.use("/api", rutas);

  app.use(rutaNoEncontrada);
  app.use(manejadorDeErrores);

  return app;
}
