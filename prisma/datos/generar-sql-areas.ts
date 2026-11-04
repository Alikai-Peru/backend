import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { areasIniciales } from "./areas-iniciales";

const q = (valor: string) => valor.replace(/'/g, "''");

let sql =
  "-- Texto de partida de las seis áreas. No reemplaza un lema que el panel ya guardó.\n";

for (const area of areasIniciales) {
  const id = `area-${area.slug}`;
  sql += `
INSERT INTO "Area" ("id", "slug", "nombre", "nombreCorto", "lema", "resumen", "descripcion", "icono", "tema", "indicadorValor", "indicadorEtiqueta", "orden", "activa", "creadoEn", "actualizadoEn")
SELECT '${id}', '${area.slug}', '${q(area.nombre)}', '${q(area.nombreCorto)}', '${q(area.lema)}', '${q(area.resumen)}', '${q(area.descripcion)}', '${area.icono}', '${area.tema}', '${q(area.indicadorValor)}', '${q(area.indicadorEtiqueta)}', ${area.orden}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Area" WHERE "slug" = '${area.slug}');

UPDATE "Area" SET
  "nombre" = '${q(area.nombre)}',
  "nombreCorto" = '${q(area.nombreCorto)}',
  "lema" = '${q(area.lema)}',
  "resumen" = '${q(area.resumen)}',
  "descripcion" = '${q(area.descripcion)}',
  "icono" = '${area.icono}',
  "tema" = '${area.tema}',
  "indicadorValor" = '${q(area.indicadorValor)}',
  "indicadorEtiqueta" = '${q(area.indicadorEtiqueta)}',
  "orden" = ${area.orden},
  "actualizadoEn" = CURRENT_TIMESTAMP
WHERE "slug" = '${area.slug}' AND "lema" = '';
`;

  area.objetivos.forEach((texto, indice) => {
    const id = `obj-${area.slug}-${indice}`;
    sql += `INSERT INTO "ObjetivoArea" ("id", "texto", "orden", "areaId")
SELECT '${id}', '${q(texto)}', ${indice}, "id" FROM "Area"
WHERE "slug" = '${area.slug}' AND "lema" = '${q(area.lema)}'
  AND NOT EXISTS (SELECT 1 FROM "ObjetivoArea" WHERE "id" = '${id}');
`;
  });

  area.programas.forEach((programa, indice) => {
    const id = `prog-${area.slug}-${indice}`;
    sql += `INSERT INTO "ProgramaArea" ("id", "titulo", "descripcion", "orden", "areaId")
SELECT '${id}', '${q(programa.titulo)}', '${q(programa.descripcion)}', ${indice}, "id" FROM "Area"
WHERE "slug" = '${area.slug}' AND "lema" = '${q(area.lema)}'
  AND NOT EXISTS (SELECT 1 FROM "ProgramaArea" WHERE "id" = '${id}');
`;
  });
}

const carpeta = path.join(
  process.cwd(),
  "prisma",
  "migrations",
  "20261104193000_areas_contenido",
);
mkdirSync(carpeta, { recursive: true });
const destino = path.join(carpeta, "migration.sql");
writeFileSync(destino, sql);
console.log(destino);
