import { z } from "zod";

export const consultaPaginadaSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(100).default(20),
});

export type ConsultaPaginada = z.infer<typeof consultaPaginadaSchema>;

export function calcularSalto({ pagina, porPagina }: ConsultaPaginada) {
  return (pagina - 1) * porPagina;
}

export function construirMeta(
  { pagina, porPagina }: ConsultaPaginada,
  total: number,
) {
  return {
    pagina,
    porPagina,
    total,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}
