import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Sprout, Users, HandHeart } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAll } from "@/lib/horta";
import type { Row } from "@/lib/horta";

export const Route = createFileRoute("/")({
  component: Painel,
});

function sum(rows: Row[], field: string): number {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function usePainelData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [participantes, canteiros, colheitas, destinacoes] = await Promise.all([
        listAll("participantes"),
        listAll("canteiros"),
        listAll("colheitas"),
        listAll("destinacoes"),
      ]);
      return {
        participantes: participantes.length,
        canteirosAtivos: canteiros.filter((c: Row) => c.status === "Ativo").length,
        canteirosTotal: canteiros.length,
        colhidoKg: sum(colheitas, "quantidade_kg"),
        destinadoKg: sum(destinacoes, "quantidade_kg"),
        porDestino: Object.entries(
          destinacoes.reduce((acc: Record<string, number>, d: Row) => {
            acc[d.tipo_destino] = (acc[d.tipo_destino] ?? 0) + Number(d.quantidade_kg ?? 0);
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1]),
      };
    },
  });
}

function Painel() {
  const { data, isLoading, isError, error } = usePainelData();
  const saldoKg = (data?.colhidoKg ?? 0) - (data?.destinadoKg ?? 0);
  const maxDestino = Math.max(...(data?.porDestino ?? []).map(([, kg]) => kg), 0);

  const cards = [
    {
      label: "Participantes cadastrados",
      value: data?.participantes ?? 0,
      icon: Users,
    },
    {
      label: "Canteiros ativos",
      value: `${data?.canteirosAtivos ?? 0} / ${data?.canteirosTotal ?? 0}`,
      icon: Sprout,
    },
    {
      label: "Total colhido (kg)",
      value: (data?.colhidoKg ?? 0).toFixed(1),
      icon: Leaf,
    },
    {
      label: "Total destinado (kg)",
      value: (data?.destinadoKg ?? 0).toFixed(1),
      icon: HandHeart,
    },
  ];

  return (
    <AppShell
      title="Painel"
      subtitle="Indicadores gerais da horta comunitária — alinhado aos ODS 2 (Fome Zero), 11 (Cidades Sustentáveis) e 12 (Consumo Responsável)."
    >
      {isError ? (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Erro ao acessar o banco de dados: {(error as Error).message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-leaf" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{isLoading ? "…" : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-baseline justify-between space-y-0">
          <CardTitle className="text-base">Resumo por destino</CardTitle>
          <span className="text-sm text-muted-foreground">
            Ainda disponível para destinar:{" "}
            <strong className="text-foreground">
              {isLoading ? "…" : `${saldoKg.toFixed(1)} kg`}
            </strong>
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.porDestino ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Carregando…" : "Nenhuma destinação registrada ainda."}
            </p>
          ) : (
            (data?.porDestino ?? []).map(([destino, kg]) => (
              <div key={destino} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">{destino}</span>
                  <span className="text-muted-foreground">{kg.toFixed(1)} kg</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-leaf"
                    style={{ width: `${maxDestino ? (kg / maxDestino) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Sobre o projeto</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          O Horta Comunitária organiza o dia a dia de uma horta coletiva: participantes, canteiros,
          culturas, plantios, atividades de manejo, colheitas e a destinação do que é colhido
          (feira, prefeitura, doação, cozinha comunitária, banco de alimentos, consumo dos
          participantes ou venda solidária), sem nunca destinar mais do que foi colhido. Use o menu
          acima para cadastrar e consultar cada uma dessas informações.
        </p>
      </div>
    </AppShell>
  );
}
