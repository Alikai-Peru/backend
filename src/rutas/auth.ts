import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db/prisma";
import { firmarToken, requiereSesion } from "../middleware/autenticacion";
import { validarCuerpo } from "../middleware/validar";
import { ErrorHttp } from "../utilidades/ErrorHttp";

export const rutasAuth = Router();

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

/** Inicio de sesión del panel de administración. */
rutasAuth.post("/login", validarCuerpo(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Se responde igual si el usuario no existe o si la clave es incorrecta,
  // para no revelar qué correos están registrados.
  const credencialesInvalidas = ErrorHttp.noAutenticado(
    "Correo o contraseña incorrectos.",
  );

  if (!usuario || !usuario.activo) {
    throw credencialesInvalidas;
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    throw credencialesInvalidas;
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  res.json({
    ok: true,
    datos: {
      token: firmarToken(usuario),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    },
  });
});

/** Datos del usuario autenticado, para validar el token desde el cliente. */
rutasAuth.get("/yo", requiereSesion, (req, res) => {
  res.json({ ok: true, datos: req.usuario });
});
