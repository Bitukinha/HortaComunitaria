import type { EntityKey } from "@/lib/entities";

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

function formatKg(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export async function validateSaldo(
  client: Queryable,
  key: EntityKey,
  values: Record<string, unknown>,
  id?: string,
) {
  if (key === "destinacoes") {
    if (!values["tipo_destino"]) throw new Error("Escolha para onde foi a colheita.");
    const quantidade = Number(values["quantidade_kg"]);
    if (!(quantidade > 0)) {
      throw new Error("A quantidade destinada deve ser maior que zero.");
    }
    const colheita = await client.query(
      "SELECT quantidade_kg FROM colheitas WHERE id = $1 FOR UPDATE",
      [values["colheita_id"]],
    );
    if (colheita.rows.length === 0) throw new Error("Colheita não encontrada.");
    const destinado = await client.query(
      "SELECT COALESCE(SUM(quantidade_kg), 0) AS total FROM destinacoes WHERE colheita_id = $1 AND id IS DISTINCT FROM $2",
      [values["colheita_id"], id ?? null],
    );
    const colhido = Number(colheita.rows[0].quantidade_kg);
    const saldo = colhido - Number(destinado.rows[0].total);
    if (quantidade > saldo + 1e-9) {
      throw new Error(
        id
          ? `Com essa alteração, o total destinado passaria do colhido (${formatKg(colhido)} kg).`
          : saldo <= 1e-9
            ? "Esta colheita já foi totalmente destinada."
            : `Quantidade maior que o disponível desta colheita (${formatKg(saldo)} kg).`,
      );
    }
  }

  if (key === "colheitas" && id) {
    const quantidade = Number(values["quantidade_kg"]);
    await client.query("SELECT id FROM colheitas WHERE id = $1 FOR UPDATE", [id]);
    const destinado = await client.query(
      "SELECT COALESCE(SUM(quantidade_kg), 0) AS total FROM destinacoes WHERE colheita_id = $1",
      [id],
    );
    const total = Number(destinado.rows[0].total);
    if (quantidade + 1e-9 < total) {
      throw new Error(
        `Esta colheita já tem ${formatKg(total)} kg destinados; a quantidade não pode ficar abaixo disso.`,
      );
    }
  }
}
