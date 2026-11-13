export type Registro = Record<string, unknown>;

export function texto(valor: unknown): string {
  return valor === null || valor === undefined ? "" : String(valor);
}

export function numero(valor: unknown): number {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

export function formatarKg(valor: number): string {
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export const TOLERANCIA_KG = 1e-9;
