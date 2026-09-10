

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { entities, type EntityKey, type Row } from "@/lib/entities";
import { getPool } from "./pool.server";

const entityKeys = Object.keys(entities) as [EntityKey, ...EntityKey[]];
const entityKeySchema = z.enum(entityKeys);

const mutationInput = z.object({
  key: entityKeySchema,
  values: z.record(z.string(), z.unknown()),
});

const updateInput = mutationInput.extend({ id: z.string() });
const deleteInput = z.object({ key: entityKeySchema, id: z.string() });

function coerceValue(fieldType: string, raw: unknown): unknown {
  if (raw === "" || raw === undefined) return null;
  if (fieldType === "number") return typeof raw === "number" ? raw : Number(raw);
  return raw;
}

export const listEntityFn = createServerFn({ method: "GET" })
  .validator((key: unknown) => entityKeySchema.parse(key))
  .handler(async ({ data: key }) => {
    const config = entities[key];
    const direction = config.ascending ? "ASC" : "DESC";
    const { rows } = await getPool().query(
      `SELECT * FROM ${key} ORDER BY ${config.orderBy} ${direction}`,
    );
    return rows as Row[];
  });

export const listAllEntityFn = createServerFn({ method: "GET" })
  .validator((key: unknown) => entityKeySchema.parse(key))
  .handler(async ({ data: key }) => {
    const { rows } = await getPool().query(`SELECT * FROM ${key}`);
    return rows as Row[];
  });

export const insertEntityFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => mutationInput.parse(input))
  .handler(async ({ data }) => {
    const config = entities[data.key];
    const columns = config.fields.map((f) => f.name);
    const values = config.fields.map((f) => coerceValue(f.type, data.values[f.name]));
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const { rows } = await getPool().query(
      `INSERT INTO ${data.key} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    return rows[0] as Row;
  });

export const updateEntityFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateInput.parse(input))
  .handler(async ({ data }) => {
    const config = entities[data.key];
    const columns = config.fields.map((f) => f.name);
    const values = config.fields.map((f) => coerceValue(f.type, data.values[f.name]));
    const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const { rows } = await getPool().query(
      `UPDATE ${data.key} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`,
      [...values, data.id],
    );
    return rows[0] as Row;
  });

export const deleteEntityFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteInput.parse(input))
  .handler(async ({ data }) => {
    await getPool().query(`DELETE FROM ${data.key} WHERE id = $1`, [data.id]);
    return { ok: true };
  });
