import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { describeRow, type Lookups } from "@/components/EntityCrud";
import { formatarKg, TIPOS_DESTINO } from "@/domain";
import { formatDate, listAll, type Row } from "@/lib/horta";

const destinos = entities.destinacoes.fields.find((f) => f.name === "tipo_destino")?.options ?? [];

function alimentoDaColheita(colheitaId: string, lookups: Lookups) {
  const colheita = lookups.colheitas?.[colheitaId];
  const plantio = colheita ? lookups.plantios?.[colheita.plantio_id] : undefined;
  return plantio ? (lookups.culturas?.[plantio.cultura_id]?.nome ?? "—") : "—";
}

export function DestinacoesReport({ lookups }: { lookups: Lookups }) {
  const [destino, setDestino] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const query = useQuery({
    queryKey: ["destinacoes", "relatorio"],
    queryFn: () => listAll("destinacoes"),
  });

  const filtradas = useMemo(
    () =>
      (query.data ?? [])
        .filter((d: Row) => !destino || d.tipo_destino === destino)
        .filter((d: Row) => !inicio || String(d.data).slice(0, 10) >= inicio)
        .filter((d: Row) => !fim || String(d.data).slice(0, 10) <= fim)
        .sort((a: Row, b: Row) => String(a.data).localeCompare(String(b.data))),
    [query.data, destino, inicio, fim],
  );

  const total = filtradas.reduce((t: number, d: Row) => t + Number(d.quantidade_kg ?? 0), 0);

  const vazio = destino
    ? "Nenhuma entrega para este destino no período escolhido."
    : "Nenhuma destinação encontrada neste período.";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prestação de contas · destinações</CardTitle>
        <p className="text-sm text-muted-foreground">
          Filtre por destino e período para ver cada entrega e o total entregue.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="filtro-destino">Destino</Label>
            <select
              id="filtro-destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Todos os destinos</option>
              {destinos.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-inicio">De</Label>
            <Input
              id="filtro-inicio"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-fim">Até</Label>
            <Input
              id="filtro-fim"
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
        </div>

        {query.isError ? (
          <p className="text-sm text-destructive">
            Erro ao acessar o banco de dados: {(query.error as Error).message}
          </p>
        ) : query.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : filtradas.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            {vazio}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead className="text-secondary-foreground">Data</TableHead>
                  <TableHead className="text-secondary-foreground">Destino</TableHead>
                  <TableHead className="text-secondary-foreground">Alimento</TableHead>
                  <TableHead className="text-secondary-foreground">Colheita de origem</TableHead>
                  <TableHead className="text-right text-secondary-foreground">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.map((d: Row) => {
                  const colheita = lookups.colheitas?.[d.colheita_id];
                  return (
                    <TableRow key={d.id}>
                      <TableCell>{formatDate(d.data)}</TableCell>
                      <TableCell>{d.tipo_destino}</TableCell>
                      <TableCell>{alimentoDaColheita(d.colheita_id, lookups)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {colheita ? describeRow("colheitas", colheita, lookups) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatarKg(Number(d.quantidade_kg))} kg
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-semibold">
                    Total ({filtradas.length} {filtradas.length === 1 ? "entrega" : "entregas"})
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatarKg(total)} kg</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
