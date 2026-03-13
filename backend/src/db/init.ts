import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './client';

const schemaPath = join(process.cwd(), 'sql/schema.sql');

async function init(): Promise<void> {
  const sql = readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  console.log('Schema applied.');
  await pool.end();
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
