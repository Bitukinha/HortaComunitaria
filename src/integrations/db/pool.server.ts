
import { Pool, types } from "pg";

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

      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      max: 5,
    });
  }
  return _pool;
}
