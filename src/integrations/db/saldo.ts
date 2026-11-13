import { Colheita, Destinacao, type Registro } from "@/domain";
import type { EntityKey } from "@/lib/entities";

type Queryable = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Registro[] }>;
};

async function carregarColheita(client: Queryable, colheitaId: unknown): Promise<Colheita> {
  const colheita = await client.query("SELECT * FROM colheitas WHERE id = $1 FOR UPDATE", [
    colheitaId,
  ]);
  const linha = colheita.rows[0];
  if (!linha) throw new Error("Colheita não encontrada.");
  const destinacoes = await client.query("SELECT * FROM destinacoes WHERE colheita_id = $1", [
    colheitaId,
  ]);
  return Colheita.fromRow(linha, destinacoes.rows);
}

export async function validateSaldo(
  client: Queryable,
  key: EntityKey,
  values: Record<string, unknown>,
  id?: string,
) {
  if (key === "destinacoes") {
    const destinacao = Destinacao.fromRow({ ...values, id: id ?? "" });
    destinacao.verificarCampos();
    const colheita = await carregarColheita(client, values["colheita_id"]);
    colheita.verificarDestinacao(destinacao, Boolean(id));
  }

  if (key === "colheitas" && id) {
    const colheita = await carregarColheita(client, id);
    colheita.verificarNovaQuantidade(Number(values["quantidade_kg"]));
  }
}
