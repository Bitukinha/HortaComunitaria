import {
  deleteEntityFn,
  insertEntityFn,
  listAllEntityFn,
  listEntityFn,
  updateEntityFn,
} from "@/integrations/db/entity-fns";
import type { EntityConfig, EntityKey, Row } from "./entities";

export type { Field, FieldType, EntityConfig, EntityKey, Row } from "./entities";
export { entities } from "./entities";

export async function listRows(config: EntityConfig): Promise<Row[]> {
  return listEntityFn({ data: config.key });
}

export async function listAll(key: EntityKey): Promise<Row[]> {
  return listAllEntityFn({ data: key });
}

export async function insertRow(key: EntityKey, values: Row): Promise<void> {
  await insertEntityFn({ data: { key, values } });
}

export async function updateRow(key: EntityKey, id: string, values: Row): Promise<void> {
  await updateEntityFn({ data: { key, id, values } });
}

export async function deleteRow(key: EntityKey, id: string): Promise<void> {
  await deleteEntityFn({ data: { key, id } });
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
