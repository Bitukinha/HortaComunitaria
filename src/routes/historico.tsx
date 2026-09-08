import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { useLookups, describeRow } from "@/components/EntityCrud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, listAll } from "@/lib/horta";
import type { EntityKey, Row } from "@/lib/horta";

export const Route = createFileRoute("/historico")({
  component: Historico,
});

function useRecent(key: EntityKey, dateField: string, limit = 8) {
  return useQuery({
    queryKey: ["historico", key],
    queryFn: async () => {
      const rows = await listAll(key);
      return [...rows]
        .sort((a: Row, b: Row) => String(b[dateField]).localeCompare(String(a[dateField])))
        .slice(0, limit);
    },
  });
}

function Historico() {
  const lookupsQuery = useLookups();
  const lookups = lookupsQuery.data ?? {};

  const atividades = useRecent("atividades", "data");
  const colheitas = useRecent("colheitas", "data");
  const destinacoes = useRecent("destinacoes", "data");

  return (
    <AppShell
      title="Histórico"
      subtitle="Últimos registros de atividades, colheitas e destinações da horta."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividades recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(atividades.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
            ) : null}
            {(atividades.data ?? []).map((row: Row) => (
              <div key={row.id} className="border-b border-border pb-2 text-sm last:border-0">
                <p className="font-medium text-foreground">
                  {row.tipo} · {formatDate(row.data)}
                </p>
                <p className="text-muted-foreground">
                  {lookups.canteiros?.[row.canteiro_id]?.identificacao ?? "—"} ·{" "}
                  {lookups.participantes?.[row.participante_id]?.nome ?? "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colheitas recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(colheitas.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
            ) : null}
            {(colheitas.data ?? []).map((row: Row) => (
              <div key={row.id} className="border-b border-border pb-2 text-sm last:border-0">
                <p className="font-medium text-foreground">
                  {row.quantidade_kg} kg · {formatDate(row.data)}
                </p>
                <p className="text-muted-foreground">
                  {lookups.plantios?.[row.plantio_id]
                    ? describeRow("plantios", lookups.plantios[row.plantio_id], lookups)
                    : "—"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Destinações recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(destinacoes.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum registro ainda.</p>
            ) : null}
            {(destinacoes.data ?? []).map((row: Row) => (
              <div key={row.id} className="border-b border-border pb-2 text-sm last:border-0">
                <p className="font-medium text-foreground">
                  {row.tipo_destino} · {row.quantidade_kg} kg
                </p>
                <p className="text-muted-foreground">{formatDate(row.data)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
