import "dotenv/config";
import { sql } from "@/db";

async function main() {
  const [connectivity] = await sql`select now() as now`;
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `;
  const constraints = await sql`
    select table_name, constraint_name, constraint_type
    from information_schema.table_constraints
    where table_schema = 'public'
      and constraint_type in ('FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY')
    order by table_name, constraint_name
  `;
  const indexes = await sql`
    select tablename, indexname
    from pg_indexes
    where schemaname = 'public'
    order by tablename, indexname
  `;

  console.log(
    JSON.stringify(
      {
        ok: true,
        connectedAt: connectivity?.now,
        tables: tables.map((row) => row.table_name),
        constraints,
        indexes,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
