// Server-only: never import this from a route/component that ships to the client bundle.
import { Pool, types } from "pg";

// Keep date/timestamp columns as raw "YYYY-MM-DD"/ISO strings instead of `pg`'s
// default JS Date objects — the UI (formatDate, <input type="date">) works
// with strings, matching the previous Supabase REST client's behavior.
types.setTypeParser(types.builtins.DATE, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMP, (value) => value);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) => value);

let _pool: Pool | undefined;

export function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString) {
      throw new Error(
        "Missing DATABASE_URL environment variable. Set it in .env to your Postgres/Neon connection string.",
      );
    }
    _pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return _pool;
}
