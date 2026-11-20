import postgres from "postgres";

// เชื่อมต่อ PostgreSQL ผ่านตัวแปร DATABASE_URL (ตั้งใน .env)
// เก็บ client ไว้ใน globalThis เพื่อไม่ให้เปิด connection ซ้ำตอน dev (hot reload)
const g = globalThis as unknown as {
  __sql?: postgres.Sql;
  __schemaReady?: Promise<void>;
};

function client(): postgres.Sql {
  if (!g.__sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("ยังไม่ได้ตั้งค่า DATABASE_URL");
    g.__sql = postgres(url, { max: 10, idle_timeout: 30 });
  }
  return g.__sql;
}

// สร้างตารางอัตโนมัติถ้ายังไม่มี (รันครั้งเดียวต่อการเปิดแอป)
async function ensureSchema(sql: postgres.Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS recurring (
      id            SERIAL PRIMARY KEY,
      amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      category      TEXT NOT NULL,
      note          TEXT NOT NULL DEFAULT '',
      day_of_month  INT  NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
      last_month    TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id            SERIAL PRIMARY KEY,
      amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      category      TEXT NOT NULL,
      note          TEXT NOT NULL DEFAULT '',
      spent_on      DATE NOT NULL,
      recurring_id  INT REFERENCES recurring(id) ON DELETE SET NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS expenses_spent_on_idx ON expenses (spent_on);

    CREATE TABLE IF NOT EXISTS budgets (
      category  TEXT PRIMARY KEY,
      amount    NUMERIC(12,2) NOT NULL CHECK (amount >= 0)
    );
  `);
}

export async function db(): Promise<postgres.Sql> {
  const sql = client();
  if (!g.__schemaReady) {
    g.__schemaReady = ensureSchema(sql).catch((e) => {
      g.__schemaReady = undefined;
      throw e;
    });
  }
  await g.__schemaReady;
  return sql;
}
