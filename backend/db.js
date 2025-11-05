
const { Pool } = require('pg');
require('dotenv').config();

const isPooler =
  String(process.env.PGPORT) === '6543' ||
  (process.env.PGHOST || '').includes('pooler.supabase.com');

// SSL: require (p/ Supabase) | disable (p/ banco sem SSL)
const sslMode = (process.env.PGSSLMODE || 'require').toLowerCase();
const ssl =
  sslMode === 'disable' ? false : { rejectUnauthorized: false };

// project=<ref> é obrigatório quando usa o pooler
let options;
if (isPooler) {
  const ref =
    process.env.SUPABASE_PROJECT_REF ||
    (process.env.SUPABASE_URL || '').match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
  if (ref) options = `project=${ref}`;
}

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || (isPooler ? 6543 : 5432)),
  database: process.env.PGDATABASE || 'postgres',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  ssl,
  ...(options ? { options } : {})
});

pool.connect()
  .then(c => { console.log('✅ Conectado ao Postgres'); c.release(); })
  .catch(e => console.error('❌ Erro ao conectar ao Postgres:', e.message));

module.exports = pool;
