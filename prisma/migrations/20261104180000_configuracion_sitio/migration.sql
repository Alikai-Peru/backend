-- CreateTable
CREATE TABLE "ConfiguracionSitio" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL DEFAULT '',
    "telefono" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "direccion" TEXT NOT NULL DEFAULT '',
    "horario" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "linkedin" TEXT NOT NULL DEFAULT '',
    "youtube" TEXT NOT NULL DEFAULT '',
    "yapeNumero" TEXT NOT NULL DEFAULT '',
    "yapeTitular" TEXT NOT NULL DEFAULT '',
    "plinNumero" TEXT NOT NULL DEFAULT '',
    "plinTitular" TEXT NOT NULL DEFAULT '',
    "bancos" JSONB NOT NULL DEFAULT '[]',
    "equipo" JSONB NOT NULL DEFAULT '[]',
    "hitos" JSONB NOT NULL DEFAULT '[]',
    "actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfiguracionSitio_pkey" PRIMARY KEY ("id")
);

INSERT INTO "ConfiguracionSitio" (
    "id", "email", "telefono", "whatsapp", "horario", "actualizadoEn"
) VALUES (
    1,
    'alikaiperu@gmail.com',
    '+51 992 575 510',
    'https://wa.link/ms4ybq',
    'Atención 24/7',
    CURRENT_TIMESTAMP
);
