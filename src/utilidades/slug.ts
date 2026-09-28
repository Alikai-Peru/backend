import { prisma } from "../db/prisma";

export function slugDesdeTexto(texto: string) {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);

  return base || "proyecto";
}

/** Genera un slug único a partir del título. Si ya existe, agrega -2, -3, etc. */
export async function slugUnicoParaProyecto(titulo: string, excluirId?: string) {
  const base = slugDesdeTexto(titulo);
  let slug = base;
  let n = 2;

  while (true) {
    const existente = await prisma.proyecto.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existente || existente.id === excluirId) return slug;
    slug = `${base}-${n}`.slice(0, 120);
    n += 1;
  }
}
