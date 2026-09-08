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
      };
    },
  });
}

function Painel() {
  const { data, isLoading } = usePainelData();

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

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Sobre o projeto</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          O Horta Comunitária organiza o dia a dia de uma horta coletiva: participantes, canteiros,
          culturas, plantios, atividades de manejo, colheitas e a destinação do que é colhido
          (doação, cozinha comunitária, banco de alimentos, consumo dos participantes ou venda
          solidária). Use o menu acima para cadastrar e consultar cada uma dessas informações.
        </p>
      </div>
    </AppShell>
  );
}
