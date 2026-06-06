/** Postgres connection pool. Configured once from the environment. */
import pg from 'pg';

const { Pool } = pg;

export const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://stepstore:stepstore@localhost:5432/stepstore';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  // add_step holds a connection while it waits on its advisory lock (#48), so a
  // burst of concurrent adds beyond the pool size can starve the pool. Fail fast
  // with a timeout instead of hanging forever — the ceiling on concurrent
  // in-flight adds is the pool size.
  connectionTimeoutMillis: 30_000,
});
