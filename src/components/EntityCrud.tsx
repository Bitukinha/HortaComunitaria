import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteRow,
  entities,
  formatDate,
  insertRow,
  listAll,
  listRows,
  todayISO,
  updateRow,
  type EntityConfig,
  type EntityKey,
  type Row,
} from "@/lib/horta";

export function describeRow(key: EntityKey, row: Row, lookups: Lookups): string {
  switch (key) {
    case "canteiros":
      return `${row.identificacao} · ${row.localizacao}`;
    case "culturas":
      return row.nome as string;
    case "participantes":
      return row.nome as string;
    case "plantios": {
      const canteiro = lookups.canteiros?.[row.canteiro_id];
      const cultura = lookups.culturas?.[row.cultura_id];
      return `${cultura?.nome ?? "Cultura"} em ${canteiro?.identificacao ?? "canteiro"} (${formatDate(row.data_plantio)})`;
    }
    case "colheitas": {
      const plantio = lookups.plantios?.[row.plantio_id];
      const cultura = plantio ? lookups.culturas?.[plantio.cultura_id] : undefined;
      return `${cultura?.nome ?? "Colheita"} · ${row.quantidade_kg} kg (${formatDate(row.data)})`;
    }
    default:
      return String(row.id).slice(0, 8);
  }
}

export type Lookups = Partial<Record<EntityKey, Record<string, Row>>>;

const referenceTables: EntityKey[] = [
  "canteiros",
  "culturas",
  "participantes",
  "plantios",
  "colheitas",
];

export function useLookups() {
  return useQuery({
    queryKey: ["lookups"],
    queryFn: async () => {
      const results = await Promise.all(referenceTables.map((t) => listAll(t)));
      const out: Lookups = {};
      referenceTables.forEach((table, i) => {
        out[table] = Object.fromEntries((results[i] ?? []).map((r) => [r.id, r]));
      });
      return out;
    },
  });
}

function emptyValues(config: EntityConfig): Row {
  const v: Row = {};
  for (const f of config.fields) {
    if (f.type === "date") v[f.name] = todayISO();
    else if (f.type === "select") v[f.name] = f.options?.[0] ?? "";
    else if (f.type === "number") v[f.name] = "";
    else v[f.name] = "";
  }
  return v;
}

export function EntityCrud({ entityKey }: { entityKey: EntityKey }) {
  const config = entities[entityKey];
  const qc = useQueryClient();
  const lookupsQuery = useLookups();
  const lookups = lookupsQuery.data ?? {};

  const rowsQuery = useQuery({
    queryKey: [entityKey],
    queryFn: () => listRows(config),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [values, setValues] = useState<Row>(() => emptyValues(config));
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const refetchAll = () => {
    void qc.invalidateQueries({ queryKey: [entityKey] });
    void qc.invalidateQueries({ queryKey: ["lookups"] });
    void qc.invalidateQueries({ queryKey: ["dashboard"] });
    void qc.invalidateQueries({ queryKey: ["historico"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: Row = {};
      for (const f of config.fields) {
        const raw = values[f.name];
        if (f.type === "number") payload[f.name] = raw === "" ? 0 : Number(raw);
        else payload[f.name] = raw ?? "";
      }
      if (editing) await updateRow(entityKey, editing.id, payload);
      else await insertRow(entityKey, payload);
    },
    onSuccess: () => {
      toast.success(editing ? `${config.singular} atualizado.` : `${config.singular} cadastrado.`);
      setDialogOpen(false);
      setEditing(null);
      refetchAll();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => deleteRow(entityKey, row.id),
    onSuccess: () => {
      toast.success(`${config.singular} excluído.`);
      setPendingDelete(null);
      refetchAll();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openCreate() {
    setEditing(null);
    setValues(emptyValues(config));
    setDialogOpen(true);
  }

  function openEdit(row: Row) {
    const v: Row = {};
    for (const f of config.fields) v[f.name] = row[f.name] ?? "";
    setEditing(row);
    setValues(v);
    setDialogOpen(true);
  }

  const missingRequired = config.fields.some(
    (f) =>
      f.required &&
      (values[f.name] === "" || values[f.name] === null || values[f.name] === undefined),
  );

  const rows = rowsQuery.data ?? [];

  const cells = useMemo(
    () =>
      rows.map((row) => ({
        row,
        values: config.fields.map((f) => {
          const raw = row[f.name];
          if (f.type === "date") return formatDate(raw);
          if (f.type === "reference" && f.refTable) {
            const target = lookups[f.refTable]?.[raw];
            return target ? describeRow(f.refTable, target, lookups) : "—";
          }
          if (raw === "" || raw === null || raw === undefined) return "—";
          return String(raw);
        }),
      })),
    [rows, lookups, config.fields],
  );

  return (
    <AppShell title={config.plural} subtitle={config.description}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rowsQuery.isLoading ? "Carregando…" : `${rows.length} registro(s)`}
        </p>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> Novo {config.singular.toLowerCase()}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              {config.fields.map((f) => (
                <TableHead key={f.name} className="text-secondary-foreground">
                  {f.label}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right text-secondary-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cells.length === 0 && !rowsQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={config.fields.length + 1}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum registro ainda. Use o botão acima para cadastrar.
                </TableCell>
              </TableRow>
            ) : null}
            {cells.map(({ row, values: cellValues }) => (
              <TableRow key={row.id}>
                {cellValues.map((v, i) => (
                  <TableCell key={i} className="align-top text-sm">
                    {v}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(row)}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPendingDelete(row)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? `Editar ${config.singular.toLowerCase()}`
                : `Novo ${config.singular.toLowerCase()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {config.fields.map((f) => {
              const id = `field-${f.name}`;
              const common = {
                id,
                value: values[f.name] ?? "",
                onChange: (e: { target: { value: string } }) =>
                  setValues((v: Row) => ({ ...v, [f.name]: e.target.value })),
              };
              return (
                <div key={f.name} className="space-y-1.5">
                  <Label htmlFor={id}>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea {...common} rows={2} />
                  ) : f.type === "select" ? (
                    <select
                      {...common}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "reference" && f.refTable ? (
                    <select
                      {...common}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione…</option>
                      {Object.values(lookups[f.refTable] ?? {}).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {describeRow(f.refTable!, opt, lookups)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      {...common}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      step={f.step}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => save.mutate()} disabled={missingRequired || save.isPending}>
              {save.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita e também remove os registros ligados a ele.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingDelete && remove.mutate(pendingDelete)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
