-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "TemaArea" AS ENUM ('marino', 'selva', 'dorado');

-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('EN_CURSO', 'FINALIZADO', 'PROXIMO');

-- CreateEnum
CREATE TYPE "MotivoContacto" AS ENUM ('VOLUNTARIADO', 'DONACION', 'ALIANZA', 'PRENSA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoMensaje" AS ENUM ('NUEVO', 'LEIDO', 'RESPONDIDO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('RECIBIDA', 'EN_EVALUACION', 'ACEPTADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "FrecuenciaDonacion" AS ENUM ('UNICA', 'MENSUAL');

-- CreateEnum
CREATE TYPE "MetodoDonacion" AS ENUM ('TRANSFERENCIA', 'YAPE', 'PLIN', 'TARJETA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoDonacion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'RECHAZADA', 'ANULADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'EDITOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreCorto" TEXT NOT NULL,
    "lema" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "tema" "TemaArea" NOT NULL DEFAULT 'marino',
    "indicadorValor" TEXT NOT NULL,
    "indicadorEtiqueta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjetivoArea" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "ObjetivoArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramaArea" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "ProgramaArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "anio" TEXT NOT NULL,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'EN_CURSO',
    "resumen" TEXT NOT NULL,
    "beneficiarios" TEXT NOT NULL,
    "avance" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "areaId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AliadoProyecto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "proyectoId" TEXT NOT NULL,

    CONSTRAINT "AliadoProyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CifraImpacto" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "sufijo" TEXT,
    "etiqueta" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CifraImpacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensajeContacto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "motivo" "MotivoContacto" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" "EstadoMensaje" NOT NULL DEFAULT 'NUEVO',
    "aceptaPrivacidad" BOOLEAN NOT NULL DEFAULT true,
    "notaInterna" TEXT,
    "ipOrigen" TEXT,
    "atendidoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEn" TIMESTAMP(3),

    CONSTRAINT "MensajeContacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostulacionVoluntario" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "profesion" TEXT NOT NULL,
    "disponibilidad" TEXT NOT NULL,
    "experiencia" TEXT,
    "motivacion" TEXT NOT NULL,
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'RECIBIDA',
    "notaInterna" TEXT,
    "areaInteresId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostulacionVoluntario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donacion" (
    "id" TEXT NOT NULL,
    "montoCentimos" INTEGER NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "frecuencia" "FrecuenciaDonacion" NOT NULL DEFAULT 'UNICA',
    "metodo" "MetodoDonacion" NOT NULL DEFAULT 'TRANSFERENCIA',
    "estado" "EstadoDonacion" NOT NULL DEFAULT 'PENDIENTE',
    "nombre" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "anonima" BOOLEAN NOT NULL DEFAULT false,
    "mensaje" TEXT,
    "referencia" TEXT,
    "areaId" TEXT,
    "proyectoId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmadaEn" TIMESTAMP(3),

    CONSTRAINT "Donacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE UNIQUE INDEX "Area_slug_key" ON "Area"("slug");

-- CreateIndex
CREATE INDEX "Area_activa_orden_idx" ON "Area"("activa", "orden");

-- CreateIndex
CREATE INDEX "ObjetivoArea_areaId_orden_idx" ON "ObjetivoArea"("areaId", "orden");

-- CreateIndex
CREATE INDEX "ProgramaArea_areaId_orden_idx" ON "ProgramaArea"("areaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_slug_key" ON "Proyecto"("slug");

-- CreateIndex
CREATE INDEX "Proyecto_estado_idx" ON "Proyecto"("estado");

-- CreateIndex
CREATE INDEX "Proyecto_areaId_idx" ON "Proyecto"("areaId");

-- CreateIndex
CREATE INDEX "Proyecto_publicado_anio_idx" ON "Proyecto"("publicado", "anio");

-- CreateIndex
CREATE INDEX "AliadoProyecto_proyectoId_idx" ON "AliadoProyecto"("proyectoId");

-- CreateIndex
CREATE UNIQUE INDEX "CifraImpacto_clave_key" ON "CifraImpacto"("clave");

-- CreateIndex
CREATE INDEX "CifraImpacto_activa_orden_idx" ON "CifraImpacto"("activa", "orden");

-- CreateIndex
CREATE INDEX "MensajeContacto_estado_creadoEn_idx" ON "MensajeContacto"("estado", "creadoEn");

-- CreateIndex
CREATE INDEX "MensajeContacto_email_idx" ON "MensajeContacto"("email");

-- CreateIndex
CREATE INDEX "PostulacionVoluntario_estado_creadoEn_idx" ON "PostulacionVoluntario"("estado", "creadoEn");

-- CreateIndex
CREATE INDEX "PostulacionVoluntario_email_idx" ON "PostulacionVoluntario"("email");

-- CreateIndex
CREATE INDEX "Donacion_estado_creadoEn_idx" ON "Donacion"("estado", "creadoEn");

-- CreateIndex
CREATE INDEX "Donacion_email_idx" ON "Donacion"("email");

-- AddForeignKey
ALTER TABLE "ObjetivoArea" ADD CONSTRAINT "ObjetivoArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramaArea" ADD CONSTRAINT "ProgramaArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AliadoProyecto" ADD CONSTRAINT "AliadoProyecto_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MensajeContacto" ADD CONSTRAINT "MensajeContacto_atendidoPorId_fkey" FOREIGN KEY ("atendidoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostulacionVoluntario" ADD CONSTRAINT "PostulacionVoluntario_areaInteresId_fkey" FOREIGN KEY ("areaInteresId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
