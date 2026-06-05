/** Postgres connection pool. Configured once from the environment. */
import pg from 'pg';

const { Pool } = pg;

export const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgres://stepstore:stepstore@localhost:5432/stepstore';

export const pool = new Pool({ connectionString: DATABASE_URL });
