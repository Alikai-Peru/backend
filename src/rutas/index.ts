import { Router } from "express";

import { prisma } from "../db/prisma";
import { crearLimiteFormulario, limiteLogin } from "../middleware/limites";
import { rutasAreas } from "./areas";
import { rutasAuth } from "./auth";
import { rutasCifras } from "./cifras";
import { rutasContacto } from "./contacto";
import { rutasDonaciones } from "./donaciones";
import { rutasProyectos } from "./proyectos";
import { rutasVoluntarios } from "./voluntarios";

export const rutas = Router();

/** Comprobación de estado, útil para monitoreo y para verificar la conexión. */
rutas.get("/salud", async (_req, res) => {
  const inicio = Date.now();
  await prisma.$queryRaw`SELECT 1`;

  res.json({
    ok: true,
    datos: {
      estado: "operativo",
      baseDeDatos: "conectada",
      latenciaMs: Date.now() - inicio,
      hora: new Date().toISOString(),
    },
  });
});

/** Índice de la API, para saber qué hay disponible sin leer el código. */
rutas.get("/", (_req, res) => {
  res.json({
    ok: true,
    datos: {
      nombre: "API de Alikai Perú",
      version: "0.1.0",
      endpoints: {
        publicos: [
          "GET  /api/salud",
          "GET  /api/areas",
          "GET  /api/areas/:slug",
          "GET  /api/proyectos",
          "GET  /api/proyectos/:slug",
          "GET  /api/cifras",
          "POST /api/contacto",
          "POST /api/voluntarios",
          "POST /api/donaciones",
        ],
        autenticacion: ["POST /api/auth/login", "GET  /api/auth/yo"],
        administracion: [
          "GET    /api/contacto",
          "PATCH  /api/contacto/:id",
          "GET    /api/voluntarios",
          "PATCH  /api/voluntarios/:id",
          "GET    /api/donaciones",
          "GET    /api/donaciones/resumen",
          "PATCH  /api/donaciones/:id",
          "POST   /api/areas",
          "PATCH  /api/areas/:slug",
          "GET    /api/proyectos/gestion",
          "POST   /api/proyectos",
          "PATCH  /api/proyectos/:slug",
          "PATCH  /api/cifras/:clave",
        ],
      },
    },
  });
});

// Los límites se aplican solo al envío de formularios públicos; las lecturas y
// las rutas del panel quedan cubiertas por el límite general. Cada formulario
// recibe su propio contador para que no compitan por la misma cuota.
rutas.use("/auth/login", limiteLogin);
rutas.post("/contacto", crearLimiteFormulario());
rutas.post("/voluntarios", crearLimiteFormulario());
rutas.post("/donaciones", crearLimiteFormulario());

rutas.use("/auth", rutasAuth);
rutas.use("/areas", rutasAreas);
rutas.use("/proyectos", rutasProyectos);
rutas.use("/cifras", rutasCifras);
rutas.use("/contacto", rutasContacto);
rutas.use("/voluntarios", rutasVoluntarios);
rutas.use("/donaciones", rutasDonaciones);
